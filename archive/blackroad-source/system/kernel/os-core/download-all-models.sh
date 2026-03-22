#!/bin/bash

# BlackRoad Model Download Script
# Downloads models with size options (quantized GGUF format)
#
# Requirements:
# - huggingface-cli installed (pip install huggingface_hub) OR
# - ollama installed (for GGUF models)
#
# Usage:
#   ./scripts/download-all-models.sh                    # Default: medium (135GB)
#   ./scripts/download-all-models.sh --size tiny        # 91GB (Q3_K_S)
#   ./scripts/download-all-models.sh --size small       # 122GB (Q4_0)
#   ./scripts/download-all-models.sh --size medium      # 135GB (Q4_K_M) ← RECOMMENDED
#   ./scripts/download-all-models.sh --size large       # 416GB (FP16)
#   ./scripts/download-all-models.sh --size full        # 964GB (everything)
#   ./scripts/download-all-models.sh --remote r2        # Upload to R2 instead
#
# Size Guide:
#   tiny   = Q3_K_S quantization (81% smaller, ~90% performance)
#   small  = Q4_0 quantization   (74% smaller, ~93% performance)
#   medium = Q4_K_M quantization (71% smaller, ~95% performance) ← BEST
#   large  = FP16 precision      (full size, 100% performance)
#   full   = All models + Grok 2 (964GB - not recommended)

set -e

# Default configuration
SIZE="${1:-medium}"
REMOTE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --size)
            SIZE="$2"
            shift 2
            ;;
        --remote)
            REMOTE="$2"
            shift 2
            ;;
        *)
            SIZE="$1"
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0#31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MODELS_DIR="${MODELS_DIR:-/data/blackroad-models}"
HF_TOKEN="${HF_TOKEN:-}"

# Determine quantization based on size
case $SIZE in
    tiny)
        QUANT="Q3_K_S"
        TOTAL_SIZE="91GB"
        ;;
    small)
        QUANT="Q4_0"
        TOTAL_SIZE="122GB"
        ;;
    medium)
        QUANT="Q4_K_M"
        TOTAL_SIZE="135GB"
        ;;
    large)
        QUANT="FP16"
        TOTAL_SIZE="416GB"
        ;;
    full)
        QUANT="FP16"
        TOTAL_SIZE="964GB"
        ;;
    *)
        echo -e "${RED}Invalid size: $SIZE${NC}"
        echo "Valid options: tiny, small, medium, large, full"
        exit 1
        ;;
esac

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  BlackRoad Model Download Script${NC}"
echo -e "${GREEN}  Size: $SIZE ($QUANT quantization)${NC}"
echo -e "${GREEN}  Total: ~$TOTAL_SIZE${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Check prerequisites
USE_OLLAMA=false
if command -v ollama &> /dev/null && [[ "$QUANT" != "FP16" ]]; then
    USE_OLLAMA=true
    echo -e "${GREEN}✓ Using Ollama for GGUF model downloads${NC}"
    echo ""
elif ! command -v huggingface-cli &> /dev/null; then
    echo -e "${RED}Error: Neither ollama nor huggingface-cli found${NC}"
    echo "Install one of:"
    echo "  - Ollama: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  - HF CLI: pip install huggingface_hub"
    exit 1
else
    echo -e "${GREEN}✓ Using Hugging Face CLI${NC}"
    if [ -z "$HF_TOKEN" ]; then
        echo -e "${YELLOW}Warning: HF_TOKEN not set${NC}"
        echo "Some models may require authentication."
        echo ""
    fi
fi

# Create models directory
mkdir -p "$MODELS_DIR"
cd "$MODELS_DIR"

echo -e "${GREEN}Models will be downloaded to: $MODELS_DIR${NC}"
echo ""

# Function to download model
download_model() {
    local model_name="$1"
    local ollama_tag="$2"
    local size="$3"

    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Model: $model_name${NC}"
    echo -e "${YELLOW}Size: ~$size${NC}"
    echo -e "${YELLOW}========================================${NC}"

    if [ "$USE_OLLAMA" = true ]; then
        # Use Ollama for GGUF downloads
        echo -e "${GREEN}Pulling via Ollama...${NC}"
        ollama pull "${ollama_tag}"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Download complete: $ollama_tag${NC}"
            echo ""
        else
            echo -e "${RED}✗ Download failed: $ollama_tag${NC}"
            echo ""
            return 1
        fi
    else
        # Use Hugging Face CLI for full precision
        local model_path="${model_name//\//-}"

        if [ -d "$model_path" ]; then
            echo -e "${GREEN}✓ Model already exists: $model_path${NC}"
            echo ""
            return 0
        fi

        huggingface-cli download "$model_name" --local-dir "$model_path" ${HF_TOKEN:+--token "$HF_TOKEN"}

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Download complete: $model_name${NC}"
            echo ""
        else
            echo -e "${RED}✗ Download failed: $model_name${NC}"
            echo ""
            return 1
        fi
    fi
}

# Download Qwen 2.5 72B Instruct (PRIMARY)
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "Qwen/Qwen2.5-72B-Instruct" \
        "qwen2.5:72b-instruct" \
        "145GB"
else
    # Use quantized version via Ollama
    download_model \
        "Qwen/Qwen2.5-72B-Instruct" \
        "qwen2.5:72b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 28GB;; Q4_0) echo 38GB;; Q4_K_M) echo 42GB;; esac)"
fi

# Download Qwen 2.5 Coder 32B
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "Qwen/Qwen2.5-Coder-32B-Instruct" \
        "qwen2.5-coder:32b-instruct" \
        "65GB"
else
    download_model \
        "Qwen/Qwen2.5-Coder-32B-Instruct" \
        "qwen2.5-coder:32b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 13GB;; Q4_0) echo 17GB;; Q4_K_M) echo 19GB;; esac)"
fi

# Download Qwen 2.5 Math 72B
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "Qwen/Qwen2.5-Math-72B-Instruct" \
        "qwen2.5-math:72b-instruct" \
        "145GB"
else
    download_model \
        "Qwen/Qwen2.5-Math-72B-Instruct" \
        "qwen2.5-math:72b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 28GB;; Q4_0) echo 38GB;; Q4_K_M) echo 42GB;; esac)"
fi

# Download Llama 3.3 70B Instruct (SECONDARY)
echo -e "${YELLOW}Note: Llama 3.3 requires Meta account and acceptance of license${NC}"
echo -e "${YELLOW}Visit: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct${NC}"
echo ""
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "meta-llama/Llama-3.3-70B-Instruct" \
        "llama3.3:70b-instruct" \
        "141GB"
else
    download_model \
        "meta-llama/Llama-3.3-70B-Instruct" \
        "llama3.3:70b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 27GB;; Q4_0) echo 37GB;; Q4_K_M) echo 41GB;; esac)"
fi

# Download Llama 3.3 8B Instruct (EDGE)
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "meta-llama/Llama-3.3-8B-Instruct" \
        "llama3.3:8b-instruct" \
        "16GB"
else
    download_model \
        "meta-llama/Llama-3.3-8B-Instruct" \
        "llama3.3:8b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 3.5GB;; Q4_0) echo 4.7GB;; Q4_K_M) echo 5.0GB;; esac)"
fi

# Download Mistral Small 3 24B (EDGE)
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "mistralai/Mistral-Small-3-24B-Instruct" \
        "mistral-small:24b-instruct" \
        "48GB"
else
    download_model \
        "mistralai/Mistral-Small-3-24B-Instruct" \
        "mistral-small:24b-instruct-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 10GB;; Q4_0) echo 13GB;; Q4_K_M) echo 14GB;; esac)"
fi

# Download DeepSeek R1 Qwen 32B (REASONING)
if [ "$QUANT" = "FP16" ]; then
    download_model \
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B" \
        "deepseek-r1:32b-qwen" \
        "65GB"
else
    download_model \
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B" \
        "deepseek-r1:32b-qwen-${QUANT,,}" \
        "$(case $QUANT in Q3_K_S) echo 13GB;; Q4_0) echo 17GB;; Q4_K_M) echo 19GB;; esac)"
fi

# Download Grok 2 (RESEARCH - LARGE)
echo -e "${YELLOW}Warning: Grok 2 is very large (~500GB)${NC}"
echo -e "${YELLOW}Skip this download if you don't need it${NC}"
read -p "Download Grok 2? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    download_model \
        "xai-org/grok-2" \
        "grok-2" \
        "500GB"
else
    echo -e "${YELLOW}Skipping Grok 2 download${NC}"
    echo ""
fi

# Summary
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Download Summary${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Models directory: $MODELS_DIR"
echo ""
echo "Downloaded models:"
ls -lh "$MODELS_DIR" | grep "^d" | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Verify model checksums against official releases"
echo "  2. Create BlackRoad training corpus"
echo "  3. Run fine-tuning with LLaMA-Factory"
echo "  4. Deploy to Railway/Cloudflare"
echo ""
echo -e "${GREEN}✓ All downloads complete!${NC}"
