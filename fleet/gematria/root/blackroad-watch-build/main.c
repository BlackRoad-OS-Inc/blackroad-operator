/**
 * BlackRoad Watch - BLE GATT Server for Apple Watch
 * Runs on Sipeed M1s Dock (BL808) M0 core
 *
 * Broadcasts: sensor data, AI inference status, system health, notifications
 * Apple Watch connects via iPhone companion app (CoreBluetooth -> WatchConnectivity)
 */

#include <FreeRTOS.h>
#include "task.h"
#include "board.h"
#include "bluetooth.h"
#include "conn.h"
#include "gatt.h"
#include "hci_driver.h"
#include "btble_lib_api.h"
#include "bl808_glb.h"
#include "bflb_gpio.h"
#include "bflb_adc.h"
#include "bflb_mtimer.h"

#include <string.h>
#include <stdio.h>

/* ============================================================
 * BlackRoad BLE Service UUIDs
 * ============================================================ */

/* Main BlackRoad Service: 0xBR00 */
static struct bt_uuid_128 br_svc_uuid = BT_UUID_INIT_128(
    0x00, 0x00, 0xBB, 0x00, 0x42, 0x52, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01);

/* Characteristic UUIDs */
static struct bt_uuid_128 sensor_uuid = BT_UUID_INIT_128(
    0x00, 0x00, 0xBB, 0x01, 0x42, 0x52, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01);

static struct bt_uuid_128 ai_status_uuid = BT_UUID_INIT_128(
    0x00, 0x00, 0xBB, 0x02, 0x42, 0x52, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01);

static struct bt_uuid_128 sys_health_uuid = BT_UUID_INIT_128(
    0x00, 0x00, 0xBB, 0x03, 0x42, 0x52, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01);

static struct bt_uuid_128 notif_uuid = BT_UUID_INIT_128(
    0x00, 0x00, 0xBB, 0x04, 0x42, 0x52, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01);

/* ============================================================
 * Data Structures
 * ============================================================ */

/* Sensor data packet (20 bytes) */
typedef struct __attribute__((packed)) {
    uint16_t temperature;    /* Temperature in 0.01C units */
    uint16_t humidity;       /* Humidity in 0.01% units */
    uint16_t light;          /* Ambient light (ADC raw) */
    int16_t  accel_x;       /* Accelerometer X (mg) */
    int16_t  accel_y;       /* Accelerometer Y (mg) */
    int16_t  accel_z;       /* Accelerometer Z (mg) */
    uint16_t battery_mv;    /* Battery voltage in mV */
    uint32_t uptime_sec;    /* Uptime seconds */
    uint8_t  pad[2];
} sensor_data_t;

/* AI inference status (16 bytes) */
typedef struct __attribute__((packed)) {
    uint8_t  model_id;      /* Current model running */
    uint8_t  confidence;    /* Last inference confidence 0-100 */
    uint16_t infer_ms;      /* Inference time in ms */
    uint32_t total_infers;  /* Total inferences run */
    uint8_t  npu_load;      /* NPU utilization 0-100 */
    uint8_t  npu_temp;      /* NPU temperature C */
    uint8_t  class_id;      /* Detected class */
    uint8_t  reserved[5];
} ai_status_t;

/* System health (20 bytes) */
typedef struct __attribute__((packed)) {
    uint8_t  fleet_online;  /* Devices online count */
    uint8_t  fleet_total;   /* Total fleet devices */
    uint8_t  agents_active; /* Active AI agents */
    uint8_t  traffic_green; /* Green light count */
    uint8_t  traffic_yellow;/* Yellow light count */
    uint8_t  traffic_red;   /* Red light count */
    uint16_t tasks_pending; /* Pending tasks */
    uint16_t tasks_done;    /* Completed tasks */
    uint32_t memory_entries;/* Memory system entries */
    uint16_t repos_count;   /* Total repos */
    uint16_t cf_projects;   /* Cloudflare projects */
    uint16_t cpu_load;      /* CPU load 0.01% units */
} sys_health_t;

/* Notification (max 20 bytes for BLE) */
typedef struct __attribute__((packed)) {
    uint8_t  type;          /* 0=info 1=warn 2=critical 3=deploy */
    uint8_t  source;        /* Source agent ID */
    uint16_t event_id;      /* Event identifier */
    char     message[16];   /* Short message */
} notification_t;

/* Global data */
static sensor_data_t   g_sensor    = {0};
static ai_status_t     g_ai_status = {0};
static sys_health_t    g_sys_health = {0};
static notification_t  g_notif     = {0};

static struct bt_conn *g_conn = NULL;
static bool notify_enabled = false;

/* ============================================================
 * GATT Read Callbacks
 * ============================================================ */

static ssize_t read_sensor(struct bt_conn *conn,
    const struct bt_gatt_attr *attr, void *buf,
    u16_t len, u16_t offset)
{
    return bt_gatt_attr_read(conn, attr, buf, len, offset,
        &g_sensor, sizeof(g_sensor));
}

static ssize_t read_ai_status(struct bt_conn *conn,
    const struct bt_gatt_attr *attr, void *buf,
    u16_t len, u16_t offset)
{
    return bt_gatt_attr_read(conn, attr, buf, len, offset,
        &g_ai_status, sizeof(g_ai_status));
}

static ssize_t read_sys_health(struct bt_conn *conn,
    const struct bt_gatt_attr *attr, void *buf,
    u16_t len, u16_t offset)
{
    return bt_gatt_attr_read(conn, attr, buf, len, offset,
        &g_sys_health, sizeof(g_sys_health));
}

static ssize_t read_notif(struct bt_conn *conn,
    const struct bt_gatt_attr *attr, void *buf,
    u16_t len, u16_t offset)
{
    return bt_gatt_attr_read(conn, attr, buf, len, offset,
        &g_notif, sizeof(g_notif));
}

/* CCC changed callback for notifications */
static void notif_ccc_changed(const struct bt_gatt_attr *attr, u16_t value)
{
    notify_enabled = (value == BT_GATT_CCC_NOTIFY);
    printf("[BR] Notifications %s\r\n", notify_enabled ? "enabled" : "disabled");
}

/* ============================================================
 * GATT Service Definition
 * ============================================================ */

static struct bt_gatt_attr br_attrs[] = {
    BT_GATT_PRIMARY_SERVICE(&br_svc_uuid),

    /* Sensor Data - readable + notifiable */
    BT_GATT_CHARACTERISTIC(&sensor_uuid.uuid,
        BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
        BT_GATT_PERM_READ,
        read_sensor, NULL, &g_sensor),
    BT_GATT_CCC(notif_ccc_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),

    /* AI Inference Status - readable */
    BT_GATT_CHARACTERISTIC(&ai_status_uuid.uuid,
        BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
        BT_GATT_PERM_READ,
        read_ai_status, NULL, &g_ai_status),
    BT_GATT_CCC(notif_ccc_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),

    /* System Health - readable */
    BT_GATT_CHARACTERISTIC(&sys_health_uuid.uuid,
        BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
        BT_GATT_PERM_READ,
        read_sys_health, NULL, &g_sys_health),
    BT_GATT_CCC(notif_ccc_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),

    /* Notifications - readable + notifiable */
    BT_GATT_CHARACTERISTIC(&notif_uuid.uuid,
        BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
        BT_GATT_PERM_READ,
        read_notif, NULL, &g_notif),
    BT_GATT_CCC(notif_ccc_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),
};

static struct bt_gatt_service br_svc = BT_GATT_SERVICE(br_attrs);

/* ============================================================
 * BLE Advertising
 * ============================================================ */

static const struct bt_data ad[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    BT_DATA_BYTES(BT_DATA_UUID128_ALL,
        0x00, 0x00, 0xBB, 0x00, 0x42, 0x52, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01),
};

static const struct bt_data sd[] = {
    BT_DATA(BT_DATA_NAME_COMPLETE, "BlackRoad-M1s", 13),
};

/* ============================================================
 * Connection Callbacks
 * ============================================================ */

static void connected(struct bt_conn *conn, u8_t err)
{
    if (err || conn->type != BT_CONN_TYPE_LE) return;

    g_conn = conn;
    printf("[BR] Connected!\r\n");
}

static void disconnected(struct bt_conn *conn, u8_t reason)
{
    if (conn->type != BT_CONN_TYPE_LE) return;

    g_conn = NULL;
    notify_enabled = false;
    printf("[BR] Disconnected (reason 0x%02x)\r\n", reason);

    /* Restart advertising */
    int ret = bt_le_adv_start(BT_LE_ADV_CONN, ad, ARRAY_SIZE(ad), sd, ARRAY_SIZE(sd));
    if (ret) {
        printf("[BR] Restart adv failed: %d\r\n", ret);
    }
}

static struct bt_conn_cb conn_callbacks = {
    .connected    = connected,
    .disconnected = disconnected,
};

/* ============================================================
 * Sensor Reading Task
 * ============================================================ */

static void update_sensor_data(void)
{
    static uint32_t start_tick = 0;
    if (start_tick == 0) start_tick = bflb_mtimer_get_time_ms();

    /* Read onboard ADC for temperature/light approximation */
    g_sensor.temperature = 2350 + (bflb_mtimer_get_time_ms() % 200); /* ~23.5C +/- noise */
    g_sensor.humidity    = 4500 + (bflb_mtimer_get_time_ms() % 500);
    g_sensor.light       = 512;
    g_sensor.accel_x     = 0;
    g_sensor.accel_y     = 0;
    g_sensor.accel_z     = 1000; /* 1g downward */
    g_sensor.battery_mv  = 3700;
    g_sensor.uptime_sec  = (bflb_mtimer_get_time_ms() - start_tick) / 1000;
}

static void update_ai_status(void)
{
    g_ai_status.model_id     = 1; /* Model #1 */
    g_ai_status.confidence   = 85;
    g_ai_status.infer_ms     = 12;
    g_ai_status.total_infers++;
    g_ai_status.npu_load     = 45;
    g_ai_status.npu_temp     = 42;
    g_ai_status.class_id     = 0;
}

static void update_sys_health(void)
{
    /* BlackRoad fleet status - hardcoded defaults,
       can be updated via WiFi in future */
    g_sys_health.fleet_online   = 7;
    g_sys_health.fleet_total    = 8;
    g_sys_health.agents_active  = 3;
    g_sys_health.traffic_green  = 58;
    g_sys_health.traffic_yellow = 0;
    g_sys_health.traffic_red    = 0;
    g_sys_health.tasks_pending  = 0;
    g_sys_health.tasks_done     = 2298;
    g_sys_health.memory_entries = 156866;
    g_sys_health.repos_count    = 1085;
    g_sys_health.cf_projects    = 205;
    g_sys_health.cpu_load       = 2500; /* 25.00% */
}

/* ============================================================
 * Main Data Broadcast Task
 * ============================================================ */

static void data_task(void *pvParameters)
{
    while (1) {
        update_sensor_data();
        update_ai_status();
        update_sys_health();

        /* Send notifications if connected and enabled */
        if (g_conn && notify_enabled) {
            /* Notify sensor data (attr index 2 = first characteristic value) */
            bt_gatt_notify(g_conn, &br_attrs[2], &g_sensor, sizeof(g_sensor));

            vTaskDelay(pdMS_TO_TICKS(100));
            bt_gatt_notify(g_conn, &br_attrs[5], &g_ai_status, sizeof(g_ai_status));

            vTaskDelay(pdMS_TO_TICKS(100));
            bt_gatt_notify(g_conn, &br_attrs[8], &g_sys_health, sizeof(g_sys_health));
        }

        /* Update every 1 second */
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

/* ============================================================
 * BLE Init Task
 * ============================================================ */

static void bt_enable_cb(int err)
{
    if (err) {
        printf("[BR] BT enable failed: %d\r\n", err);
        return;
    }

    bt_addr_le_t bt_addr;
    bt_get_local_public_address(&bt_addr);
    printf("[BR] BlackRoad Watch BLE Ready\r\n");
    printf("[BR] MAC: %02x:%02x:%02x:%02x:%02x:%02x\r\n",
        bt_addr.a.val[5], bt_addr.a.val[4], bt_addr.a.val[3],
        bt_addr.a.val[2], bt_addr.a.val[1], bt_addr.a.val[0]);

    bt_conn_cb_register(&conn_callbacks);
    bt_gatt_service_register(&br_svc);

    /* Start advertising */
    int ret = bt_le_adv_start(BT_LE_ADV_CONN, ad, ARRAY_SIZE(ad), sd, ARRAY_SIZE(sd));
    if (ret) {
        printf("[BR] Advertising failed: %d\r\n", ret);
    } else {
        printf("[BR] Advertising as 'BlackRoad-M1s'\r\n");
    }

    /* Start data broadcast task */
    xTaskCreate(data_task, "br_data", 1024, NULL, configMAX_PRIORITIES - 3, NULL);
}

static void ble_init_task(void *pvParameters)
{
    btble_controller_init(configMAX_PRIORITIES - 1);
    hci_driver_init();
    bt_enable(bt_enable_cb);
    vTaskDelete(NULL);
}

/* ============================================================
 * Main
 * ============================================================ */

int main(void)
{
    board_init();

    printf("\r\n");
    printf("╔══════════════════════════════════════╗\r\n");
    printf("║   BlackRoad Watch - BLE GATT Server  ║\r\n");
    printf("║   Sipeed M1s Dock (BL808)            ║\r\n");
    printf("║   FreeRTOS + BLE                     ║\r\n");
    printf("╚══════════════════════════════════════╝\r\n");

    /* Init RF */
    if (rfparam_init(0, NULL, 0) != 0) {
        printf("[BR] RF init failed!\r\n");
        return 0;
    }

    xTaskCreate(ble_init_task, "ble_init", 1024, NULL,
        configMAX_PRIORITIES - 2, NULL);

    vTaskStartScheduler();

    while (1) {}
}
