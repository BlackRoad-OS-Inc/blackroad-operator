/*
 * BlackRoad Heltec LoRa 32 V3 — Dual Radio Node
 * LoRa (SX1262, 915 MHz, km range) + ESP-NOW (WiFi, 200m range)
 * OLED status display, battery monitoring
 *
 * Flash: pio run -e heltec_lora -t upload
 */

#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <SPI.h>
#include <Wire.h>

// Heltec LoRa 32 V3 pin definitions
#define LORA_SCK   9
#define LORA_MISO  11
#define LORA_MOSI  10
#define LORA_CS    8
#define LORA_RST   12
#define LORA_DIO1  14
#define LORA_BUSY  13

#define OLED_SDA   17
#define OLED_SCL   18
#define OLED_RST   21

#define VBAT_PIN   1
#define LED_PIN    35

// LoRa config — must match Waveshare SX1262
#define LORA_FREQ       915.0   // MHz
#define LORA_BW         125.0   // kHz
#define LORA_SF         9       // spreading factor
#define LORA_CR         7       // coding rate 4/7
#define LORA_TX_POWER   22      // dBm
#define LORA_PREAMBLE   12
#define LORA_SYNC_WORD  0x12    // private network

// ESP-NOW
#define MESH_CHANNEL 1
uint8_t broadcast_addr[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Packet header (shared with ESP-NOW mesh)
struct __attribute__((packed)) MeshPacket {
    uint8_t  magic[2];     // 'B','R'
    uint8_t  type;         // 0x01=beacon, 0x02=data, 0x10=lora_relay
    uint8_t  src_mac[6];
    uint8_t  hop_count;
    uint8_t  ttl;
    uint16_t seq;
    uint8_t  payload_len;
    uint8_t  payload[200];
};

uint8_t my_mac[6];
char node_name[16] = "heltec-";
uint16_t seq_counter = 0;
uint32_t last_beacon = 0;
uint32_t rx_lora = 0;
uint32_t rx_espnow = 0;
uint32_t tx_lora = 0;
uint32_t tx_espnow = 0;

// Simple SX1262 direct SPI driver
// (Using raw SPI since RadioLib may not be available)
SPIClass loraSPI(FSPI);

void lora_write_reg(uint16_t addr, uint8_t val) {
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(0x0D);  // WriteRegister
    loraSPI.transfer((addr >> 8) & 0xFF);
    loraSPI.transfer(addr & 0xFF);
    loraSPI.transfer(val);
    digitalWrite(LORA_CS, HIGH);
}

void lora_cmd(uint8_t cmd, uint8_t* data, uint8_t len) {
    while (digitalRead(LORA_BUSY)) delay(1);
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(cmd);
    for (int i = 0; i < len; i++) loraSPI.transfer(data[i]);
    digitalWrite(LORA_CS, HIGH);
}

void lora_reset() {
    pinMode(LORA_RST, OUTPUT);
    digitalWrite(LORA_RST, LOW);
    delay(20);
    digitalWrite(LORA_RST, HIGH);
    delay(50);
}

bool lora_init() {
    pinMode(LORA_CS, OUTPUT);
    pinMode(LORA_BUSY, INPUT);
    pinMode(LORA_DIO1, INPUT);
    digitalWrite(LORA_CS, HIGH);

    loraSPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_CS);
    loraSPI.setFrequency(2000000);

    lora_reset();
    delay(100);

    // Set standby mode
    uint8_t standby[] = {0x00};  // STDBY_RC
    lora_cmd(0x80, standby, 1);
    delay(10);

    // Set packet type to LoRa
    uint8_t pkt_type[] = {0x01};  // PACKET_TYPE_LORA
    lora_cmd(0x8A, pkt_type, 1);

    // Set RF frequency: freq_reg = freq_hz * 2^25 / 32e6
    uint32_t freq_reg = (uint32_t)((LORA_FREQ * 1000000.0) / 32000000.0 * 33554432.0);
    uint8_t freq[] = {
        (uint8_t)((freq_reg >> 24) & 0xFF),
        (uint8_t)((freq_reg >> 16) & 0xFF),
        (uint8_t)((freq_reg >> 8) & 0xFF),
        (uint8_t)(freq_reg & 0xFF)
    };
    lora_cmd(0x86, freq, 4);

    // Set TX power
    uint8_t pa_config[] = {0x04, 0x07, 0x00, 0x01};  // +22dBm
    lora_cmd(0x95, pa_config, 4);
    uint8_t tx_params[] = {0x16, 0x07};  // +22dBm, ramp 200us
    lora_cmd(0x8E, tx_params, 2);

    // Set modulation params (SF9, BW125, CR4/7)
    uint8_t mod_params[] = {LORA_SF, 0x04, 0x03, 0x00};  // SF, BW125, CR4/7, no LDRO
    lora_cmd(0x8B, mod_params, 4);

    // Set packet params
    uint8_t pkt_params[] = {0x00, LORA_PREAMBLE, 0x00, 0xFF, 0x01};  // preamble, explicit header, max 255B, CRC on
    lora_cmd(0x8C, pkt_params, 5);

    // Set sync word
    lora_write_reg(0x0740, (LORA_SYNC_WORD >> 4) << 4 | 0x04);
    lora_write_reg(0x0741, (LORA_SYNC_WORD & 0x0F) << 4 | 0x04);

    // Set DIO1 for RxDone
    uint8_t dio_mask[] = {0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00};
    lora_cmd(0x08, dio_mask, 8);

    Serial.println("[LORA] SX1262 initialized: 915MHz SF9 BW125 +22dBm");
    return true;
}

void lora_send(uint8_t* data, uint8_t len) {
    // Write buffer
    while (digitalRead(LORA_BUSY)) delay(1);
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(0x0E);  // WriteBuffer
    loraSPI.transfer(0x00);  // offset
    for (int i = 0; i < len; i++) loraSPI.transfer(data[i]);
    digitalWrite(LORA_CS, HIGH);

    // Set payload length
    uint8_t pkt_params[] = {0x00, LORA_PREAMBLE, 0x00, len, 0x01};
    lora_cmd(0x8C, pkt_params, 5);

    // TX with timeout (3 seconds)
    uint8_t tx_cmd[] = {0x00, 0xEA, 0x60};  // 3s timeout
    lora_cmd(0x83, tx_cmd, 3);

    // Wait for TX done
    uint32_t start = millis();
    while (!digitalRead(LORA_DIO1) && millis() - start < 5000) delay(1);

    // Clear IRQ
    uint8_t clr[] = {0xFF, 0xFF};
    lora_cmd(0x02, clr, 2);

    tx_lora++;
    Serial.printf("\033[38;5;205m[LORA TX %u]\033[0m %dB\n", tx_lora, len);
}

void lora_start_rx() {
    // Continuous RX
    uint8_t rx_cmd[] = {0xFF, 0xFF, 0xFF};  // continuous
    lora_cmd(0x82, rx_cmd, 3);
}

int lora_check_rx(uint8_t* buf) {
    if (!digitalRead(LORA_DIO1)) return 0;

    // Get RX buffer status
    while (digitalRead(LORA_BUSY)) delay(1);
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(0x13);  // GetRxBufferStatus
    loraSPI.transfer(0x00);  // NOP
    uint8_t len = loraSPI.transfer(0x00);
    uint8_t offset = loraSPI.transfer(0x00);
    digitalWrite(LORA_CS, HIGH);

    if (len == 0 || len > 255) {
        uint8_t clr[] = {0xFF, 0xFF};
        lora_cmd(0x02, clr, 2);
        lora_start_rx();
        return 0;
    }

    // Read buffer
    while (digitalRead(LORA_BUSY)) delay(1);
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(0x1E);  // ReadBuffer
    loraSPI.transfer(offset);
    loraSPI.transfer(0x00);  // NOP
    for (int i = 0; i < len; i++) buf[i] = loraSPI.transfer(0x00);
    digitalWrite(LORA_CS, HIGH);

    // Get RSSI
    while (digitalRead(LORA_BUSY)) delay(1);
    digitalWrite(LORA_CS, LOW);
    loraSPI.transfer(0x14);  // GetPacketStatus
    loraSPI.transfer(0x00);
    int8_t rssi = -(loraSPI.transfer(0x00) / 2);
    int8_t snr = (int8_t)loraSPI.transfer(0x00) / 4;
    digitalWrite(LORA_CS, HIGH);

    // Clear IRQ and restart RX
    uint8_t clr[] = {0xFF, 0xFF};
    lora_cmd(0x02, clr, 2);
    lora_start_rx();

    rx_lora++;
    Serial.printf("\033[38;5;82m[LORA RX %u]\033[0m %dB rssi=%d snr=%d\n",
        rx_lora, len, rssi, snr);

    return len;
}

// ESP-NOW callbacks
void on_espnow_recv(const esp_now_recv_info_t* info, const uint8_t* data, int len) {
    rx_espnow++;
    if (len >= 2 && data[0] == 'B' && data[1] == 'R') {
        MeshPacket* pkt = (MeshPacket*)data;
        // Relay ESP-NOW packets to LoRa (bridge!)
        pkt->type = 0x10;  // mark as lora_relay
        lora_send((uint8_t*)pkt, 11 + pkt->payload_len);
        Serial.printf("\033[38;5;135m[BRIDGE]\033[0m ESP-NOW→LoRa %dB\n", len);
    }
}

void on_espnow_sent(const uint8_t* mac, esp_now_send_status_t status) {}

float read_battery() {
    int raw = analogRead(VBAT_PIN);
    return (raw / 4095.0) * 3.3 * 2.0;  // voltage divider
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);

    // Get MAC
    WiFi.mode(WIFI_STA);
    WiFi.macAddress(my_mac);
    snprintf(node_name, 16, "heltec-%02X%02X", my_mac[4], my_mac[5]);

    Serial.printf("\n\033[38;5;205m╔══════════════════════════════════════╗\033[0m\n");
    Serial.printf("\033[38;5;205m║\033[0m  BlackRoad Dual Radio: LoRa + Mesh  \033[38;5;205m║\033[0m\n");
    Serial.printf("\033[38;5;205m╚══════════════════════════════════════╝\033[0m\n");
    Serial.printf("Node: %s | Battery: %.2fV\n\n", node_name, read_battery());

    // Init LoRa
    if (!lora_init()) {
        Serial.println("[FATAL] LoRa init failed!");
    }
    lora_start_rx();

    // Init ESP-NOW
    esp_wifi_set_channel(MESH_CHANNEL, WIFI_SECOND_CHAN_NONE);
    esp_now_init();
    esp_now_register_recv_cb(on_espnow_recv);
    esp_now_register_send_cb(on_espnow_sent);

    esp_now_peer_info_t peer_info = {};
    memcpy(peer_info.peer_addr, broadcast_addr, 6);
    peer_info.channel = MESH_CHANNEL;
    esp_now_add_peer(&peer_info);

    Serial.println("Both radios active. Listening...\n");
    Serial.println("Commands: send <msg> | lora <msg> | status | help");
}

void loop() {
    // Check LoRa RX
    uint8_t lora_buf[256];
    int lora_len = lora_check_rx(lora_buf);
    if (lora_len > 0) {
        // Bridge LoRa → ESP-NOW
        if (lora_len >= 2 && lora_buf[0] == 'B' && lora_buf[1] == 'R') {
            esp_now_send(broadcast_addr, lora_buf, lora_len);
            Serial.printf("\033[38;5;135m[BRIDGE]\033[0m LoRa→ESP-NOW %dB\n", lora_len);
        } else {
            // Print raw
            Serial.printf("[LORA RAW] ");
            for (int i = 0; i < min(lora_len, 64); i++) {
                if (lora_buf[i] >= 32 && lora_buf[i] < 127)
                    Serial.printf("%c", lora_buf[i]);
                else
                    Serial.printf("\\x%02X", lora_buf[i]);
            }
            Serial.println();
        }
    }

    // Beacon every 10s
    if (millis() - last_beacon >= 10000) {
        // LoRa beacon
        MeshPacket pkt = {};
        pkt.magic[0] = 'B'; pkt.magic[1] = 'R';
        pkt.type = 0x01;
        memcpy(pkt.src_mac, my_mac, 6);
        pkt.hop_count = 0;
        pkt.ttl = 3;
        pkt.seq = ++seq_counter;
        pkt.payload_len = strlen(node_name);
        memcpy(pkt.payload, node_name, pkt.payload_len);

        lora_send((uint8_t*)&pkt, 11 + pkt.payload_len);

        // ESP-NOW beacon
        esp_now_send(broadcast_addr, (uint8_t*)&pkt, 11 + pkt.payload_len);
        tx_espnow++;

        last_beacon = millis();
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));  // blink
    }

    // Serial commands
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();

        if (cmd.startsWith("send ")) {
            String msg = cmd.substring(5);
            MeshPacket pkt = {};
            pkt.magic[0] = 'B'; pkt.magic[1] = 'R';
            pkt.type = 0x02;
            memcpy(pkt.src_mac, my_mac, 6);
            pkt.seq = ++seq_counter;
            pkt.ttl = 3;
            pkt.payload_len = msg.length();
            memcpy(pkt.payload, msg.c_str(), pkt.payload_len);
            // Send on BOTH radios
            lora_send((uint8_t*)&pkt, 11 + pkt.payload_len);
            esp_now_send(broadcast_addr, (uint8_t*)&pkt, 11 + pkt.payload_len);
            tx_espnow++;
        } else if (cmd.startsWith("lora ")) {
            // Raw LoRa send
            String msg = cmd.substring(5);
            lora_send((uint8_t*)msg.c_str(), msg.length());
        } else if (cmd == "status") {
            Serial.printf("\n\033[38;5;205m=== %s ===\033[0m\n", node_name);
            Serial.printf("Battery: %.2fV\n", read_battery());
            Serial.printf("LoRa:    TX=%u RX=%u (915MHz SF%d)\n", tx_lora, rx_lora, LORA_SF);
            Serial.printf("ESP-NOW: TX=%u RX=%u (ch%d)\n", tx_espnow, rx_espnow, MESH_CHANNEL);
            Serial.println();
        }
    }

    delay(10);
}
