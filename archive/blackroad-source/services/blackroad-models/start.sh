#!/bin/bash
# BlackRoad Model Server Startup Script

set -e

echo "🚀 Starting BlackRoad Model Server"
echo "Model: ${MODEL_ID}"
echo "Base: ${BASE_MODEL}"

# Download LoRA weights if needed
if [ ! -d "${LORA_MODEL_PATH}" ]; then
  echo "📦 Downloading LoRA weights..."
  # TODO: Download from S3 or model registry
  # For now, assume weights are baked into image or volume
fi

# Start vLLM server with LoRA
echo "🔥 Starting vLLM server..."

python -m vllm.entrypoints.openai.api_server \
  --model "${BASE_MODEL}" \
  --enable-lora \
  --lora-modules "blackroad-coder=${LORA_MODEL_PATH}" \
  --host "${HOST}" \
  --port "${PORT}" \
  --max-model-len "${VLLM_MAX_MODEL_LEN}" \
  --gpu-memory-utilization "${VLLM_GPU_MEMORY_UTILIZATION}" \
  --tensor-parallel-size "${VLLM_TENSOR_PARALLEL_SIZE}" \
  --quantization "${VLLM_QUANTIZATION}" \
  --max-num-seqs "${MAX_NUM_SEQS}" \
  --enable-prefix-caching \
  --served-model-name "${MODEL_NAME}" \
  --api-key "${API_KEY}"
