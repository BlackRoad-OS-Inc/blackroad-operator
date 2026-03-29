/*
 * BlackRoad ESP-NOW Mesh Radio
 * Turns any ESP32 into a mesh radio node (~200m range, no WiFi router needed)
 * Flash with: pio run -t upload
 *
 * ESP-NOW: peer-to-peer WiFi frames, 250 byte payload, <1ms latency
 * Works on: ESP32-S3 SuperMini, M5Stack Atom, any ESP32
 */

#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>

// BlackRoad mesh config
#define MESH_CHANNEL 1
#define BEACON_INTERVAL_MS 10000
#define MAX_PEERS 20
#define NODE_NAME_MAX 16

// Broadcast address (all nodes)
uint8_t broadcast_addr[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Packet types
enum PktType : uint8_t {
    PKT_BEACON   = 0x01,
    PKT_DATA     = 0x02,
    PKT_ACK      = 0x03,
    PKT_DISCOVER = 0x04,
    PKT_RELAY    = 0x05,
};

// BlackRoad mesh packet header
struct __attribute__((packed)) MeshPacket {
    uint8_t  magic[2];     // 'B','R'
    uint8_t  type;
    uint8_t  src_mac[6];
    uint8_t  hop_count;
    uint8_t  ttl;
    uint16_t seq;
    uint8_t  payload_len;
    uint8_t  payload[200];
};

// Known peer tracking
struct Peer {
    uint8_t mac[6];
    int8_t  rssi;
    uint32_t last_seen;
    uint16_t last_seq;
    char name[NODE_NAME_MAX];
};

Peer peers[MAX_PEERS];
int peer_count = 0;
uint16_t seq_counter = 0;
uint32_t last_beacon = 0;
uint32_t rx_count = 0;
uint32_t tx_count = 0;
char node_name[NODE_NAME_MAX] = "road-";
uint8_t my_mac[6];

// Forward declarations
void send_beacon();
void send_data(const uint8_t* data, uint8_t len);
void relay_packet(MeshPacket* pkt);
int find_or_add_peer(const uint8_t* mac);
void print_mac(const uint8_t* mac);

// ESP-NOW receive callback
void on_recv(const uint8_t* mac_addr, const uint8_t* data, int len) {
    int8_t _rssi = -50;  // placeholder when no recv_info available
    if (len < 5) return;

    MeshPacket* pkt = (MeshPacket*)data;
    if (pkt->magic[0] != 'B' || pkt->magic[1] != 'R') {
        // Not a BlackRoad packet - log raw
        Serial.printf("[RX] raw %dB: ", len);
        for (int i = 0; i < min(len, 32); i++) Serial.printf("%02X ", data[i]);
        Serial.println();
        return;
    }

    rx_count++;

    // Track peer
    int idx = find_or_add_peer(pkt->src_mac);
    if (idx >= 0) {
        peers[idx].last_seen = millis();
        peers[idx].last_seq = pkt->seq;
        peers[idx].rssi = _rssi;
    }

    // Don't process our own relayed packets
    if (memcmp(pkt->src_mac, my_mac, 6) == 0) return;

    switch (pkt->type) {
        case PKT_BEACON: {
            char name[NODE_NAME_MAX + 1] = {0};
            memcpy(name, pkt->payload, min((int)pkt->payload_len, NODE_NAME_MAX));
            if (idx >= 0) strncpy(peers[idx].name, name, NODE_NAME_MAX);
            Serial.printf("\033[38;5;82m[BEACON]\033[0m ");
            print_mac(pkt->src_mac);
            Serial.printf(" rssi=%d hop=%d name=%s\n",
                peers[idx >= 0 ? idx : 0].rssi, pkt->hop_count, name);
            break;
        }
        case PKT_DATA: {
            Serial.printf("\033[38;5;69m[DATA]\033[0m ");
            print_mac(pkt->src_mac);
            Serial.printf(" hop=%d len=%d: ", pkt->hop_count, pkt->payload_len);
            Serial.write(pkt->payload, pkt->payload_len);
            Serial.println();

            // Relay if TTL > 0
            if (pkt->ttl > 0) {
                relay_packet(pkt);
            }
            break;
        }
        case PKT_DISCOVER: {
            // Respond with beacon
            send_beacon();
            break;
        }
    }
}

// ESP-NOW send callback
void on_sent(const uint8_t* mac, esp_now_send_status_t status) {
    if (status != ESP_NOW_SEND_SUCCESS) {
        Serial.printf("\033[38;5;214m[TX FAIL]\033[0m to ");
        print_mac(mac);
        Serial.println();
    }
}

void send_beacon() {
    MeshPacket pkt = {};
    pkt.magic[0] = 'B';
    pkt.magic[1] = 'R';
    pkt.type = PKT_BEACON;
    memcpy(pkt.src_mac, my_mac, 6);
    pkt.hop_count = 0;
    pkt.ttl = 3;
    pkt.seq = ++seq_counter;
    pkt.payload_len = strlen(node_name);
    memcpy(pkt.payload, node_name, pkt.payload_len);

    size_t total = 11 + pkt.payload_len;
    esp_now_send(broadcast_addr, (uint8_t*)&pkt, total);
    tx_count++;
}

void send_data(const uint8_t* data, uint8_t len) {
    MeshPacket pkt = {};
    pkt.magic[0] = 'B';
    pkt.magic[1] = 'R';
    pkt.type = PKT_DATA;
    memcpy(pkt.src_mac, my_mac, 6);
    pkt.hop_count = 0;
    pkt.ttl = 3;
    pkt.seq = ++seq_counter;
    pkt.payload_len = min(len, (uint8_t)200);
    memcpy(pkt.payload, data, pkt.payload_len);

    size_t total = 11 + pkt.payload_len;
    esp_now_send(broadcast_addr, (uint8_t*)&pkt, total);
    tx_count++;
    Serial.printf("\033[38;5;205m[TX %u]\033[0m %dB\n", tx_count, len);
}

void relay_packet(MeshPacket* pkt) {
    pkt->hop_count++;
    pkt->ttl--;
    esp_now_send(broadcast_addr, (uint8_t*)pkt, 11 + pkt->payload_len);
    tx_count++;
    Serial.printf("\033[38;5;135m[RELAY]\033[0m hop=%d ttl=%d\n", pkt->hop_count, pkt->ttl);
}

int find_or_add_peer(const uint8_t* mac) {
    for (int i = 0; i < peer_count; i++) {
        if (memcmp(peers[i].mac, mac, 6) == 0) return i;
    }
    if (peer_count < MAX_PEERS) {
        memcpy(peers[peer_count].mac, mac, 6);
        peers[peer_count].last_seen = millis();
        peers[peer_count].name[0] = 0;
        return peer_count++;
    }
    return -1;
}

void print_mac(const uint8_t* mac) {
    Serial.printf("%02X:%02X:%02X:%02X:%02X:%02X",
        mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
}

void print_status() {
    Serial.printf("\n\033[38;5;205m=== BlackRoad Mesh Node: %s ===\033[0m\n", node_name);
    Serial.printf("MAC: "); print_mac(my_mac); Serial.println();
    Serial.printf("TX: %u | RX: %u | Peers: %d\n", tx_count, rx_count, peer_count);
    for (int i = 0; i < peer_count; i++) {
        uint32_t age = (millis() - peers[i].last_seen) / 1000;
        Serial.printf("  [%d] ", i);
        print_mac(peers[i].mac);
        Serial.printf(" rssi=%d age=%us name=%s\n",
            peers[i].rssi, age, peers[i].name[0] ? peers[i].name : "?");
    }
    Serial.println();
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    // Generate node name from last 2 bytes of MAC
    WiFi.mode(WIFI_STA);
    WiFi.macAddress(my_mac);
    snprintf(node_name, NODE_NAME_MAX, "road-%02X%02X", my_mac[4], my_mac[5]);

    Serial.printf("\n\033[38;5;205m╔══════════════════════════════════╗\033[0m\n");
    Serial.printf("\033[38;5;205m║\033[0m  BlackRoad ESP-NOW Mesh Radio    \033[38;5;205m║\033[0m\n");
    Serial.printf("\033[38;5;205m╚══════════════════════════════════╝\033[0m\n");
    Serial.printf("Node: %s | MAC: ", node_name);
    print_mac(my_mac);
    Serial.println();

    // Set WiFi channel
    esp_wifi_set_channel(MESH_CHANNEL, WIFI_SECOND_CHAN_NONE);

    // Init ESP-NOW
    if (esp_now_init() != ESP_OK) {
        Serial.println("[FATAL] ESP-NOW init failed");
        return;
    }
    esp_now_register_recv_cb(on_recv);
    esp_now_register_send_cb(on_sent);

    // Add broadcast peer
    esp_now_peer_info_t peer_info = {};
    memcpy(peer_info.peer_addr, broadcast_addr, 6);
    peer_info.channel = MESH_CHANNEL;
    peer_info.encrypt = false;
    esp_now_add_peer(&peer_info);

    Serial.println("Listening + beaconing...\n");
    Serial.println("Serial commands: send <msg> | status | discover | help");
}

void loop() {
    // Periodic beacon
    if (millis() - last_beacon >= BEACON_INTERVAL_MS) {
        send_beacon();
        last_beacon = millis();
    }

    // Serial command input
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();

        if (cmd.startsWith("send ")) {
            String msg = cmd.substring(5);
            send_data((const uint8_t*)msg.c_str(), msg.length());
        } else if (cmd == "status") {
            print_status();
        } else if (cmd == "discover") {
            MeshPacket pkt = {};
            pkt.magic[0] = 'B'; pkt.magic[1] = 'R';
            pkt.type = PKT_DISCOVER;
            memcpy(pkt.src_mac, my_mac, 6);
            pkt.seq = ++seq_counter;
            pkt.ttl = 5;
            pkt.payload_len = 0;
            esp_now_send(broadcast_addr, (uint8_t*)&pkt, 11);
            Serial.println("[DISCOVER] Sent");
        } else if (cmd == "peers") {
            print_status();
        } else if (cmd == "help") {
            Serial.println("send <msg>  - Send data to mesh");
            Serial.println("status      - Show node status + peers");
            Serial.println("discover    - Find nearby nodes");
            Serial.println("peers       - List known peers");
        }
    }

    delay(10);
}
