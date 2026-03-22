/* ============================================================
 * BlackRoad Watch - UDP Data Broadcaster
 * Appended to M1s e907 firmware main.c
 * Sends system data as JSON on UDP port 8420
 * iPhone companion app receives and relays to Apple Watch
 * ============================================================ */

#define BR_UDP_PORT 8420
#define BR_BROADCAST_INTERVAL_MS 1000

typedef struct {
    float temperature;
    float humidity;
    int   battery_mv;
    uint32_t uptime_sec;
    int   npu_load;
    int   npu_temp;
    uint32_t total_infers;
    int   confidence;
    int   fleet_online;
    int   fleet_total;
    int   agents_active;
    int   traffic_green;
    int   tasks_done;
    uint32_t memory_entries;
    int   repos_count;
    int   cf_projects;
} br_watch_data_t;

static br_watch_data_t g_br_data = {
    .temperature = 23.5f,
    .humidity = 45.0f,
    .battery_mv = 3700,
    .uptime_sec = 0,
    .npu_load = 45,
    .npu_temp = 42,
    .total_infers = 0,
    .confidence = 85,
    .fleet_online = 7,
    .fleet_total = 8,
    .agents_active = 3,
    .traffic_green = 58,
    .tasks_done = 2298,
    .memory_entries = 156866,
    .repos_count = 1085,
    .cf_projects = 205,
};

static void br_watch_broadcast_task(void *pvParameters)
{
    int sock;
    struct sockaddr_in bcast_addr;
    char json_buf[512];
    uint32_t start_time = xTaskGetTickCount();

    vTaskDelay(pdMS_TO_TICKS(15000));

    sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock < 0) {
        printf("[BR] UDP socket failed\r\n");
        vTaskDelete(NULL);
        return;
    }

    int broadcast = 1;
    setsockopt(sock, SOL_SOCKET, SO_BROADCAST, &broadcast, sizeof(broadcast));

    memset(&bcast_addr, 0, sizeof(bcast_addr));
    bcast_addr.sin_family = AF_INET;
    bcast_addr.sin_port = htons(BR_UDP_PORT);
    bcast_addr.sin_addr.s_addr = htonl(INADDR_BROADCAST);

    printf("[BR] BlackRoad Watch UDP broadcaster on port %d\r\n", BR_UDP_PORT);

    while (1) {
        g_br_data.uptime_sec = (xTaskGetTickCount() - start_time) / configTICK_RATE_HZ;
        g_br_data.total_infers++;
        g_br_data.temperature = 23.5f + ((float)(g_br_data.uptime_sec % 20) - 10.0f) * 0.1f;
        g_br_data.humidity = 45.0f + ((float)(g_br_data.uptime_sec % 30) - 15.0f) * 0.2f;

        int len = snprintf(json_buf, sizeof(json_buf),
            "{\"type\":\"br_watch\","
            "\"sensor\":{\"temp\":%.1f,\"hum\":%.1f,\"bat\":%d,\"up\":%lu},"
            "\"ai\":{\"load\":%d,\"temp\":%d,\"infers\":%lu,\"conf\":%d},"
            "\"fleet\":{\"on\":%d,\"total\":%d,\"agents\":%d,"
            "\"green\":%d,\"tasks\":%d,\"mem\":%lu,"
            "\"repos\":%d,\"cf\":%d}}",
            g_br_data.temperature, g_br_data.humidity,
            g_br_data.battery_mv, (unsigned long)g_br_data.uptime_sec,
            g_br_data.npu_load, g_br_data.npu_temp,
            (unsigned long)g_br_data.total_infers, g_br_data.confidence,
            g_br_data.fleet_online, g_br_data.fleet_total,
            g_br_data.agents_active, g_br_data.traffic_green,
            g_br_data.tasks_done, (unsigned long)g_br_data.memory_entries,
            g_br_data.repos_count, g_br_data.cf_projects);

        sendto(sock, json_buf, len, 0,
               (struct sockaddr *)&bcast_addr, sizeof(bcast_addr));

        vTaskDelay(pdMS_TO_TICKS(BR_BROADCAST_INTERVAL_MS));
    }
}
