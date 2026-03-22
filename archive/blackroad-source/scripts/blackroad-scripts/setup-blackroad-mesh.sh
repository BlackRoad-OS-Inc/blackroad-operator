#!/bin/bash
# BlackRoad Mesh Onboarding - Run on each device

set -e

echo "🖤 BlackRoad Mesh Onboarding"
echo "============================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ -f /etc/os-release ]]; then
    . /etc/os-release
    if [[ "$ID" == "raspbian" ]] || [[ "$ID" == "debian" ]]; then
        OS="pi"
    fi
else
    echo "❌ Unsupported OS"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Ask for hostname
read -p "Enter hostname for this device: " HOSTNAME
echo ""

# Install Tailscale
echo "📦 Installing Tailscale..."
if [[ "$OS" == "mac" ]]; then
    if ! command -v tailscale &> /dev/null; then
        brew install tailscale
    fi
    sudo tailscale up --hostname=$HOSTNAME
elif [[ "$OS" == "pi" ]]; then
    if ! command -v tailscale &> /dev/null; then
        curl -fsSL https://tailscale.com/install.sh | sh
    fi
    sudo tailscale up --hostname=$HOSTNAME
fi

# Get Tailscale IP
TS_IP=$(tailscale ip -4 2>/dev/null || echo "Not connected yet")
echo "✅ Tailscale IP: $TS_IP"
echo ""

# Install MQTT client
echo "📦 Installing MQTT client..."
if [[ "$OS" == "mac" ]]; then
    brew list mosquitto &>/dev/null || brew install mosquitto
elif [[ "$OS" == "pi" ]]; then
    sudo apt install -y mosquitto-clients
fi

# Test connection to broker
echo "🧪 Testing MQTT connection to pi-ops..."
if mosquitto_pub -h 192.168.4.202 -t "system/heartbeat/$HOSTNAME" -m "online" 2>/dev/null; then
    echo "✅ MQTT connection successful"
else
    echo "⚠️  MQTT broker not reachable yet (run this script on pi-ops first)"
fi
echo ""

# Device-specific setup
if [[ "$HOSTNAME" == "macbook-brain" ]]; then
    echo "🧠 Setting up Agent Orchestration Brain..."
    
    # Install Ollama
    if ! command -v ollama &> /dev/null; then
        echo "Installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    fi
    
    # Install NATS
    if [[ "$OS" == "mac" ]]; then
        brew list nats-server &>/dev/null || brew install nats-server
        brew services start nats-server
    fi
    
    # Pull models
    echo "Pulling LLM models (this may take a while)..."
    ollama pull llama3.2:3b &
    ollama pull phi3 &
    wait
    
    echo "✅ Brain setup complete"
    
elif [[ "$HOSTNAME" == "macbook-monitor" ]]; then
    echo "📊 Setting up Monitoring Station..."
    
    if [[ "$OS" == "mac" ]]; then
        brew list grafana &>/dev/null || brew install grafana
        brew list influxdb &>/dev/null || brew install influxdb
        brew list prometheus &>/dev/null || brew install prometheus
        
        brew services start grafana
        brew services start influxdb
        brew services start prometheus
        
        echo "✅ Monitoring setup complete"
        echo "📊 Grafana: http://localhost:3001"
        echo "📊 InfluxDB: http://localhost:8086"
    fi
    
elif [[ "$HOSTNAME" == "pi-ops" ]]; then
    echo "🎛️ Setting up Operations Hub..."
    
    # Install MQTT broker
    sudo apt install -y mosquitto mosquitto-clients
    sudo systemctl enable mosquitto
    sudo systemctl start mosquitto
    
    # Install monitoring tools
    sudo apt install -y btop python3-pip python3-serial
    
    # Set static IP
    if ! grep -q "static ip_address=192.168.4.202" /etc/dhcpcd.conf; then
        echo "interface eth0" | sudo tee -a /etc/dhcpcd.conf
        echo "static ip_address=192.168.4.202/24" | sudo tee -a /etc/dhcpcd.conf
        echo "static routers=192.168.4.1" | sudo tee -a /etc/dhcpcd.conf
        echo "static domain_name_servers=192.168.4.1 8.8.8.8" | sudo tee -a /etc/dhcpcd.conf
        echo "⚠️  Reboot required for static IP"
    fi
    
    echo "✅ Pi-Ops setup complete"
    
elif [[ "$HOSTNAME" == "pi-holo" ]]; then
    echo "🎨 Setting up Hologram Renderer..."
    
    # Install camera support
    sudo apt install -y python3-picamera2 libcamera-apps
    
    # Set static IP
    if ! grep -q "static ip_address=192.168.4.200" /etc/dhcpcd.conf; then
        echo "interface eth0" | sudo tee -a /etc/dhcpcd.conf
        echo "static ip_address=192.168.4.200/24" | sudo tee -a /etc/dhcpcd.conf
        echo "static routers=192.168.4.1" | sudo tee -a /etc/dhcpcd.conf
        echo "static domain_name_servers=192.168.4.1 8.8.8.8" | sudo tee -a /etc/dhcpcd.conf
        echo "⚠️  Reboot required for static IP"
    fi
    
    echo "✅ Pi-Holo setup complete"

elif [[ "$HOSTNAME" == "alexandria" ]]; then
    echo "📚 Setting up Development Station..."
    echo "✅ Alexandria (M1 Mac) - Already configured"
fi

echo ""
echo "🎉 Onboarding complete for $HOSTNAME!"
echo "🌐 Tailscale IP: $TS_IP"
echo "🔗 Local IP: $(hostname -I 2>/dev/null | awk '{print $1}' || ipconfig getifaddr en0)"
echo ""
echo "Next steps:"
echo "  - Run this script on other devices"
echo "  - Test connectivity: ping $HOSTNAME"
echo "  - Check MQTT: mosquitto_sub -h 192.168.4.202 -t '#' -v"
echo ""
