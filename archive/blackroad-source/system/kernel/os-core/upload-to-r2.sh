#!/bin/bash

# BlackRoad Models - R2 Upload Script
# Uploads quantized models from Ollama to Cloudflare R2
#
# Requirements:
# - wrangler CLI installed (npm install -g wrangler)
# - rclone installed (brew install rclone)
# - Cloudflare account with R2 enabled
# - Ollama models already downloaded
#
# Usage:
#   ./upload-to-r2.sh                    # Upload all models
#   ./upload-to-r2.sh qwen-2.5-72b      # Upload specific model

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${BUCKET_NAME:-blackroad-models}"
OLLAMA_MODELS_DIR="${OLLAMA_MODELS_DIR:-$HOME/.ollama/models}"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  BlackRoad Models - R2 Upload${NC}"
echo -e "${GREEN}  Bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler not found${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

if ! command -v rclone &> /dev/null; then
    echo -e "${RED}Error: rclone not found${NC}"
    echo "Install with: brew install rclone"
    exit 1
fi

# Check if bucket exists, create if not
echo -e "${BLUE}Checking R2 bucket...${NC}"
if wrangler r2 bucket list | grep -q "$BUCKET_NAME"; then
    echo -e "${GREEN}✓ Bucket '$BUCKET_NAME' exists${NC}"
else
    echo -e "${YELLOW}Creating bucket '$BUCKET_NAME'...${NC}"
    wrangler r2 bucket create "$BUCKET_NAME"
    echo -e "${GREEN}✓ Bucket created${NC}"
fi
echo ""

# Configure rclone for R2 (one-time setup)
echo -e "${BLUE}Configuring rclone for R2...${NC}"
if ! rclone listremotes | grep -q "r2:"; then
    echo -e "${YELLOW}Setting up rclone remote 'r2'${NC}"
    echo ""
    echo -e "${YELLOW}Please provide your Cloudflare R2 credentials:${NC}"
    echo "You can find these at: https://dash.cloudflare.com → R2 → Manage R2 API Tokens"
    echo ""

    rclone config create r2 s3 \
        provider Cloudflare \
        env_auth false \
        endpoint https://<ACCOUNT_ID>.r2.cloudflarestorage.com

    echo -e "${GREEN}✓ rclone configured${NC}"
else
    echo -e "${GREEN}✓ rclone remote 'r2' already exists${NC}"
fi
echo ""

# Function to upload model
upload_model() {
    local model_name="$1"
    local ollama_tag="$2"
    local r2_path="$3"

    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Model: $model_name${NC}"
    echo -e "${YELLOW}Ollama Tag: $ollama_tag${NC}"
    echo -e "${YELLOW}R2 Path: $r2_path${NC}"
    echo -e "${YELLOW}========================================${NC}"

    # Find Ollama model directory
    # Ollama stores models in manifests and blobs, need to export first
    echo -e "${BLUE}Exporting model from Ollama...${NC}"

    # Create temp directory
    local temp_dir="/tmp/blackroad-export-$(date +%s)"
    mkdir -p "$temp_dir"

    # Export model using ollama show --modelfile (to get GGUF path)
    # Note: This is a simplified version - real Ollama export is complex
    echo -e "${YELLOW}Note: Manual export required${NC}"
    echo "Run: ollama show $ollama_tag --modelfile"
    echo "Then find the GGUF file path and copy to $temp_dir"
    echo ""
    read -p "Have you copied the model files to $temp_dir? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping $model_name${NC}"
        rm -rf "$temp_dir"
        return 0
    fi

    # Upload to R2 using rclone
    echo -e "${BLUE}Uploading to R2...${NC}"
    rclone copy "$temp_dir/" "r2:$BUCKET_NAME/$r2_path/" \
        --progress \
        --transfers 4 \
        --checkers 8 \
        --s3-chunk-size 64M

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Upload complete: $r2_path${NC}"

        # Create manifest
        cat > "$temp_dir/MANIFEST.json" << EOF
{
  "model_name": "$model_name",
  "ollama_tag": "$ollama_tag",
  "quantization": "Q4_K_M",
  "uploaded_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "uploaded_by": "blackroad-upload-script",
  "r2_bucket": "$BUCKET_NAME",
  "r2_path": "$r2_path"
}
EOF

        # Upload manifest
        rclone copy "$temp_dir/MANIFEST.json" "r2:$BUCKET_NAME/$r2_path/"

        echo -e "${GREEN}✓ Manifest uploaded${NC}"
    else
        echo -e "${RED}✗ Upload failed: $model_name${NC}"
        rm -rf "$temp_dir"
        return 1
    fi

    # Cleanup
    rm -rf "$temp_dir"
    echo ""
}

# Function to upload from Hugging Face (alternative method)
upload_from_hf() {
    local model_name="$1"
    local hf_repo="$2"
    local r2_path="$3"

    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Model: $model_name${NC}"
    echo -e "${YELLOW}HuggingFace: $hf_repo${NC}"
    echo -e "${YELLOW}R2 Path: $r2_path${NC}"
    echo -e "${YELLOW}========================================${NC}"

    # Create temp directory
    local temp_dir="/tmp/blackroad-hf-$(date +%s)"
    mkdir -p "$temp_dir"

    # Download from HuggingFace
    echo -e "${BLUE}Downloading from HuggingFace...${NC}"
    huggingface-cli download "$hf_repo" \
        --local-dir "$temp_dir" \
        --local-dir-use-symlinks False

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Download failed${NC}"
        rm -rf "$temp_dir"
        return 1
    fi

    # Upload to R2
    echo -e "${BLUE}Uploading to R2...${NC}"
    rclone copy "$temp_dir/" "r2:$BUCKET_NAME/$r2_path/" \
        --progress \
        --transfers 4 \
        --checkers 8 \
        --s3-chunk-size 64M

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Upload complete: $r2_path${NC}"
    else
        echo -e "${RED}✗ Upload failed${NC}"
        rm -rf "$temp_dir"
        return 1
    fi

    # Cleanup
    rm -rf "$temp_dir"
    echo ""
}

# Main upload logic
SPECIFIC_MODEL="${1:-all}"

if [ "$SPECIFIC_MODEL" = "all" ]; then
    echo -e "${BLUE}Uploading all models...${NC}"
    echo ""

    # Upload all 5 core models
    upload_model \
        "Qwen 2.5 72B Q4_K_M" \
        "qwen2.5:72b-instruct-q4_k_m" \
        "qwen-2.5-72b-q4_k_m"

    upload_model \
        "Llama 3.3 70B Q4_K_M" \
        "llama3.3:70b-instruct-q4_k_m" \
        "llama-3.3-70b-q4_k_m"

    upload_model \
        "Qwen Coder 32B Q4_K_M" \
        "qwen2.5-coder:32b-instruct-q4_k_m" \
        "qwen-coder-32b-q4_k_m"

    upload_model \
        "DeepSeek R1 32B Q4_K_M" \
        "deepseek-r1:32b-qwen-q4_k_m" \
        "deepseek-r1-32b-q4_k_m"

    upload_model \
        "Mistral Small 24B Q4_K_M" \
        "mistral-small:24b-instruct-q4_k_m" \
        "mistral-24b-q4_k_m"
else
    # Upload specific model
    case $SPECIFIC_MODEL in
        qwen-2.5-72b)
            upload_model \
                "Qwen 2.5 72B Q4_K_M" \
                "qwen2.5:72b-instruct-q4_k_m" \
                "qwen-2.5-72b-q4_k_m"
            ;;
        llama-3.3-70b)
            upload_model \
                "Llama 3.3 70B Q4_K_M" \
                "llama3.3:70b-instruct-q4_k_m" \
                "llama-3.3-70b-q4_k_m"
            ;;
        qwen-coder-32b)
            upload_model \
                "Qwen Coder 32B Q4_K_M" \
                "qwen2.5-coder:32b-instruct-q4_k_m" \
                "qwen-coder-32b-q4_k_m"
            ;;
        deepseek-r1-32b)
            upload_model \
                "DeepSeek R1 32B Q4_K_M" \
                "deepseek-r1:32b-qwen-q4_k_m" \
                "deepseek-r1-32b-q4_k_m"
            ;;
        mistral-24b)
            upload_model \
                "Mistral Small 24B Q4_K_M" \
                "mistral-small:24b-instruct-q4_k_m" \
                "mistral-24b-q4_k_m"
            ;;
        *)
            echo -e "${RED}Unknown model: $SPECIFIC_MODEL${NC}"
            echo "Valid options: qwen-2.5-72b, llama-3.3-70b, qwen-coder-32b, deepseek-r1-32b, mistral-24b, all"
            exit 1
            ;;
    esac
fi

# Create catalog
echo -e "${BLUE}Creating model catalog...${NC}"
cat > /tmp/CATALOG.json << 'EOF'
{
  "catalog_version": "1.0.0",
  "updated_at": "TIMESTAMP",
  "bucket": "blackroad-models",
  "models": [
    {
      "id": "qwen-2.5-72b-q4_k_m",
      "name": "Qwen 2.5 72B Instruct Q4_K_M",
      "path": "qwen-2.5-72b-q4_k_m/",
      "quantization": "Q4_K_M",
      "size_gb": 42,
      "identity": "model:blackroad:qwen-72b:v1:sovereign",
      "use_cases": ["general", "multilingual", "coding"]
    },
    {
      "id": "llama-3.3-70b-q4_k_m",
      "name": "Llama 3.3 70B Instruct Q4_K_M",
      "path": "llama-3.3-70b-q4_k_m/",
      "quantization": "Q4_K_M",
      "size_gb": 41,
      "identity": "model:blackroad:llama-70b:v1:sovereign",
      "use_cases": ["general", "reasoning", "instruction-following"]
    },
    {
      "id": "qwen-coder-32b-q4_k_m",
      "name": "Qwen 2.5 Coder 32B Q4_K_M",
      "path": "qwen-coder-32b-q4_k_m/",
      "quantization": "Q4_K_M",
      "size_gb": 19,
      "identity": "model:blackroad:qwen-coder-32b:v1:sovereign",
      "use_cases": ["coding", "debugging", "infrastructure"]
    },
    {
      "id": "deepseek-r1-32b-q4_k_m",
      "name": "DeepSeek R1 32B Qwen Q4_K_M",
      "path": "deepseek-r1-32b-q4_k_m/",
      "quantization": "Q4_K_M",
      "size_gb": 19,
      "identity": "model:blackroad:deepseek-32b:v1:sovereign",
      "use_cases": ["reasoning", "mathematics", "policy"]
    },
    {
      "id": "mistral-24b-q4_k_m",
      "name": "Mistral Small 3 24B Q4_K_M",
      "path": "mistral-24b-q4_k_m/",
      "quantization": "Q4_K_M",
      "size_gb": 14,
      "identity": "model:blackroad:mistral-24b:v1:sovereign",
      "use_cases": ["edge", "low-latency", "general"]
    }
  ]
}
EOF

# Update timestamp
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
sed -i.bak "s/TIMESTAMP/$TIMESTAMP/g" /tmp/CATALOG.json
rm /tmp/CATALOG.json.bak

# Upload catalog
rclone copy /tmp/CATALOG.json "r2:$BUCKET_NAME/"
echo -e "${GREEN}✓ Catalog uploaded${NC}"
rm /tmp/CATALOG.json

# Summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Upload Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "R2 Bucket: $BUCKET_NAME"
echo ""
echo "Uploaded models:"
rclone lsd "r2:$BUCKET_NAME/" | awk '{print "  - " $5}'
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Verify uploads: rclone ls r2:$BUCKET_NAME/"
echo "  2. Deploy Railway services"
echo "  3. Configure DNS for agent domains"
echo "  4. Test inference endpoints"
echo ""
echo -e "${GREEN}✓ All uploads complete!${NC}"
