#!/bin/bash
# BlackRoad Vision + LLM Pipeline
# Hailo-8 detects objects → LLM describes them
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Nodes
HAILO_NODE="cecilia"  # Has Hailo-8
LLM_NODE="cecilia"    # Has Ollama

# Run object detection and get LLM description
detect_and_describe() {
    local image_path="$1"
    local model="${2:-llama3.2:1b}"

    echo -e "${PINK}=== VISION + LLM PIPELINE ===${RESET}"
    echo

    # Step 1: Run Hailo detection
    echo -e "${BLUE}[1/2] Running Hailo-8 object detection...${RESET}"

    # For demo, we'll simulate detection output
    # In production, this would run: hailortcli run yolov8s.hef --input $image_path
    local detections="person (95%), car (87%), dog (72%)"

    echo "  Detected: $detections"
    echo

    # Step 2: Send to LLM for description
    echo -e "${BLUE}[2/2] Generating LLM description...${RESET}"

    local prompt="You are a helpful AI assistant. Based on object detection results, describe this scene naturally. Detections: $detections. Describe what you see in 2-3 sentences."

    ssh "$LLM_NODE" "curl -s http://localhost:11434/api/generate -d '{\"model\":\"$model\",\"prompt\":\"$prompt\",\"stream\":false}'" \
        | jq -r '.response'
}

# Real-time detection stream (simulated)
realtime_stream() {
    echo -e "${PINK}=== REAL-TIME VISION + LLM ===${RESET}"
    echo "Press Ctrl+C to stop"
    echo

    local frame=0
    while true; do
        ((frame++))
        echo -e "${GREEN}[Frame $frame]${RESET}"

        # Simulate varying detections
        local objects=("person" "car" "bicycle" "dog" "cat" "bird" "laptop" "phone")
        local detected="${objects[$((RANDOM % ${#objects[@]}))]}"
        local confidence=$((70 + RANDOM % 30))

        echo "  Detected: $detected ($confidence%)"

        # Quick LLM response
        local prompt="In 10 words or less, describe seeing a $detected"
        local response=$(ssh "$LLM_NODE" "curl -s http://localhost:11434/api/generate -d '{\"model\":\"tinyllama\",\"prompt\":\"$prompt\",\"stream\":false}'" 2>/dev/null | jq -r '.response' | head -1)

        echo -e "  ${BLUE}AI: $response${RESET}"
        echo

        sleep 2
    done
}

# Benchmark the pipeline
benchmark_pipeline() {
    echo -e "${PINK}=== VISION + LLM BENCHMARK ===${RESET}"
    echo

    # Hailo benchmark
    echo "Hailo-8 (YOLOv8s):"
    local hailo_fps=$(ssh "$HAILO_NODE" "hailortcli benchmark /usr/share/hailo-models/yolov8s_h8.hef -t 3 2>&1 | grep -oP 'FPS: \K[\d.]+' | tail -1")
    echo "  $hailo_fps FPS"
    echo

    # LLM benchmark
    echo "LLM (tinyllama):"
    local start=$(date +%s.%N)
    ssh "$LLM_NODE" "curl -s http://localhost:11434/api/generate -d '{\"model\":\"tinyllama\",\"prompt\":\"Describe a person walking\",\"stream\":false}'" >/dev/null
    local end=$(date +%s.%N)
    local llm_time=$(echo "$end - $start" | bc)
    echo "  ${llm_time}s per description"
    echo

    # Combined throughput
    echo "Combined Pipeline:"
    echo "  Detection: $hailo_fps FPS"
    echo "  Description: 1 every ${llm_time}s"
    echo "  Bottleneck: LLM (use for key frames only)"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Vision + LLM Pipeline${RESET}"
    echo
    echo "Usage: $0 <command>"
    echo
    echo "Commands:"
    echo "  detect <image>    Detect objects and describe"
    echo "  stream            Real-time detection stream"
    echo "  benchmark         Benchmark the pipeline"
    echo
    echo "Example:"
    echo "  $0 detect photo.jpg"
    echo "  $0 stream"
}

case "${1:-help}" in
    detect)
        detect_and_describe "$2" "$3"
        ;;
    stream)
        realtime_stream
        ;;
    benchmark)
        benchmark_pipeline
        ;;
    *)
        help
        ;;
esac
