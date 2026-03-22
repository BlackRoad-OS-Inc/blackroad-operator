#!/bin/bash
# BlackRoad Model Fine-tuning Pipeline
# Fine-tune LLMs on the Pi cluster using QLoRA
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RESET='\033[0m'

FINETUNE_DIR="$HOME/.blackroad/finetune"
DATASETS_DIR="$FINETUNE_DIR/datasets"
MODELS_DIR="$FINETUNE_DIR/models"
CHECKPOINTS_DIR="$FINETUNE_DIR/checkpoints"

# Training nodes (nodes with most RAM)
TRAIN_NODES=("cecilia" "lucidia")
PRIMARY_NODE="cecilia"

# Default training parameters
DEFAULT_EPOCHS=3
DEFAULT_BATCH_SIZE=4
DEFAULT_LEARNING_RATE="2e-4"
DEFAULT_LORA_R=16
DEFAULT_LORA_ALPHA=32

# Initialize
init() {
    mkdir -p "$DATASETS_DIR" "$MODELS_DIR" "$CHECKPOINTS_DIR"
    echo -e "${GREEN}Fine-tuning pipeline initialized${RESET}"
    echo "  Datasets: $DATASETS_DIR"
    echo "  Models: $MODELS_DIR"
    echo "  Checkpoints: $CHECKPOINTS_DIR"
    echo "  Training nodes: ${TRAIN_NODES[*]}"
}

# Create training dataset from conversations
create_dataset() {
    local name="$1"
    local format="${2:-alpaca}"

    echo -e "${PINK}=== CREATE TRAINING DATASET ===${RESET}"
    echo "Name: $name"
    echo "Format: $format"
    echo

    local dataset_file="$DATASETS_DIR/$name.jsonl"

    echo "Enter training examples (JSON format, empty line to finish):"
    echo "Format: {\"instruction\": \"...\", \"input\": \"...\", \"output\": \"...\"}"
    echo

    > "$dataset_file"
    while true; do
        echo -n "> "
        read -r line
        [ -z "$line" ] && break

        # Validate JSON
        if echo "$line" | jq . >/dev/null 2>&1; then
            echo "$line" >> "$dataset_file"
            echo -e "  ${GREEN}✓${RESET} Added"
        else
            echo -e "  ${YELLOW}Invalid JSON, skipped${RESET}"
        fi
    done

    local count=$(wc -l < "$dataset_file")
    echo
    echo -e "${GREEN}Dataset created: $count examples${RESET}"
    echo "File: $dataset_file"
}

# Import dataset from file
import_dataset() {
    local file="$1"
    local name="${2:-$(basename "$file" .jsonl)}"

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}File not found: $file${RESET}"
        return 1
    fi

    cp "$file" "$DATASETS_DIR/$name.jsonl"

    local count=$(wc -l < "$DATASETS_DIR/$name.jsonl")
    echo -e "${GREEN}Imported: $name ($count examples)${RESET}"
}

# Generate training script
generate_train_script() {
    local model="$1"
    local dataset="$2"
    local output_name="$3"

    cat << 'TRAINSCRIPT'
#!/usr/bin/env python3
"""
BlackRoad Fine-tuning Script
Uses QLoRA for memory-efficient training on Pi
"""
import json
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
import sys

# Configuration
MODEL_NAME = sys.argv[1] if len(sys.argv) > 1 else "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
DATASET_PATH = sys.argv[2] if len(sys.argv) > 2 else "dataset.jsonl"
OUTPUT_DIR = sys.argv[3] if len(sys.argv) > 3 else "./output"

LORA_R = 16
LORA_ALPHA = 32
LORA_DROPOUT = 0.05

print(f"Loading model: {MODEL_NAME}")

# Load model with 4-bit quantization for Pi
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    load_in_4bit=True,
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token

# Prepare for training
model = prepare_model_for_kbit_training(model)

# LoRA config
lora_config = LoraConfig(
    r=LORA_R,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# Load dataset
print(f"Loading dataset: {DATASET_PATH}")
with open(DATASET_PATH, 'r') as f:
    data = [json.loads(line) for line in f]

def format_example(ex):
    text = f"### Instruction:\n{ex['instruction']}\n\n"
    if ex.get('input'):
        text += f"### Input:\n{ex['input']}\n\n"
    text += f"### Response:\n{ex['output']}"
    return {"text": text}

formatted = [format_example(ex) for ex in data]
dataset = Dataset.from_list(formatted)

def tokenize(example):
    return tokenizer(example["text"], truncation=True, max_length=512, padding="max_length")

tokenized = dataset.map(tokenize)

# Training arguments optimized for Pi
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=2,
    warmup_ratio=0.03,
    optim="adamw_torch"
)

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False)
)

print("Starting training...")
trainer.train()

# Save
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Model saved to {OUTPUT_DIR}")
TRAINSCRIPT
}

# Start fine-tuning job
finetune() {
    local base_model="${1:-tinyllama}"
    local dataset="$2"
    local output_name="${3:-custom-model}"

    if [ -z "$dataset" ]; then
        echo -e "${YELLOW}Usage: finetune <base_model> <dataset> [output_name]${RESET}"
        return 1
    fi

    local dataset_file="$DATASETS_DIR/$dataset.jsonl"
    if [ ! -f "$dataset_file" ]; then
        echo -e "${RED}Dataset not found: $dataset${RESET}"
        return 1
    fi

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🎯 FINE-TUNING JOB 🎯                              ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo "Base model: $base_model"
    echo "Dataset: $dataset ($(wc -l < "$dataset_file") examples)"
    echo "Output: $output_name"
    echo "Training node: $PRIMARY_NODE"
    echo

    # Create training script
    local train_script="/tmp/blackroad_train_$$.py"
    generate_train_script "$base_model" "$dataset" "$output_name" > "$train_script"

    # Transfer dataset to training node
    echo -e "${BLUE}Transferring dataset...${RESET}"
    scp "$dataset_file" "$PRIMARY_NODE:/tmp/train_dataset.jsonl"

    # Transfer and run training script
    echo -e "${BLUE}Starting training on $PRIMARY_NODE...${RESET}"
    scp "$train_script" "$PRIMARY_NODE:/tmp/train.py"

    ssh "$PRIMARY_NODE" "
        cd /tmp
        python3 train.py '$base_model' 'train_dataset.jsonl' '$CHECKPOINTS_DIR/$output_name'
    " 2>&1 | while read -r line; do
        echo "  $line"
    done

    # Retrieve model
    echo -e "${BLUE}Retrieving fine-tuned model...${RESET}"
    scp -r "$PRIMARY_NODE:$CHECKPOINTS_DIR/$output_name" "$MODELS_DIR/"

    echo
    echo -e "${GREEN}Fine-tuning complete!${RESET}"
    echo "Model saved: $MODELS_DIR/$output_name"
}

# Quick fine-tune from text file (one response per line)
quick_finetune() {
    local file="$1"
    local persona="${2:-assistant}"

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}Usage: quick-finetune <text_file> [persona]${RESET}"
        return 1
    fi

    echo -e "${PINK}=== QUICK FINE-TUNE ===${RESET}"
    echo "Source: $file"
    echo "Persona: $persona"
    echo

    local dataset_name="quick_$(date +%s)"
    local dataset_file="$DATASETS_DIR/$dataset_name.jsonl"

    # Convert text to training format
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        echo "{\"instruction\":\"Respond as $persona would.\",\"input\":\"\",\"output\":\"$line\"}" >> "$dataset_file"
    done < "$file"

    local count=$(wc -l < "$dataset_file")
    echo "Created dataset: $count examples"
    echo

    finetune "tinyllama" "$dataset_name" "${persona}-model"
}

# List available datasets
list_datasets() {
    echo -e "${PINK}=== TRAINING DATASETS ===${RESET}"
    echo

    for f in "$DATASETS_DIR"/*.jsonl; do
        [ -f "$f" ] || continue
        local name=$(basename "$f" .jsonl)
        local count=$(wc -l < "$f")
        local size=$(du -h "$f" | cut -f1)
        echo "  $name: $count examples ($size)"
    done
}

# List fine-tuned models
list_models() {
    echo -e "${PINK}=== FINE-TUNED MODELS ===${RESET}"
    echo

    for d in "$MODELS_DIR"/*/; do
        [ -d "$d" ] || continue
        local name=$(basename "$d")
        local size=$(du -sh "$d" | cut -f1)
        echo "  $name ($size)"
    done
}

# Deploy model to Ollama
deploy_model() {
    local model_path="$1"
    local model_name="${2:-custom}"

    echo -e "${PINK}=== DEPLOY TO OLLAMA ===${RESET}"
    echo "Model: $model_path"
    echo "Name: $model_name"
    echo

    # Create Modelfile
    local modelfile="/tmp/Modelfile.$model_name"
    cat > "$modelfile" << EOF
FROM $model_path
SYSTEM "You are a helpful AI assistant fine-tuned on custom data."
PARAMETER temperature 0.7
PARAMETER top_p 0.9
EOF

    # Deploy to each node
    for node in "${TRAIN_NODES[@]}"; do
        echo -n "  Deploying to $node... "
        scp "$modelfile" "$node:/tmp/Modelfile"
        scp -r "$model_path" "$node:/tmp/model_weights"
        ssh "$node" "cd /tmp && ollama create $model_name -f Modelfile" 2>/dev/null
        echo -e "${GREEN}done${RESET}"
    done

    echo
    echo -e "${GREEN}Model deployed as: $model_name${RESET}"
}

# Training status
status() {
    echo -e "${PINK}=== FINE-TUNING STATUS ===${RESET}"
    echo

    local datasets=$(ls -1 "$DATASETS_DIR"/*.jsonl 2>/dev/null | wc -l)
    local models=$(ls -1d "$MODELS_DIR"/*/ 2>/dev/null | wc -l)
    local checkpoints=$(ls -1d "$CHECKPOINTS_DIR"/*/ 2>/dev/null | wc -l)

    echo "  Datasets: $datasets"
    echo "  Fine-tuned models: $models"
    echo "  Checkpoints: $checkpoints"
    echo "  Primary node: $PRIMARY_NODE"
    echo

    echo "Node status:"
    for node in "${TRAIN_NODES[@]}"; do
        echo -n "  $node: "
        if ssh -o ConnectTimeout=2 "$node" "echo ok" >/dev/null 2>&1; then
            local mem=$(ssh "$node" "free -h | awk '/Mem:/ {print \$3\"/\"\$2}'" 2>/dev/null)
            echo -e "${GREEN}ONLINE${RESET} (RAM: $mem)"
        else
            echo -e "${YELLOW}OFFLINE${RESET}"
        fi
    done
}

# Help
help() {
    echo -e "${PINK}BlackRoad Model Fine-tuning Pipeline${RESET}"
    echo
    echo "Fine-tune LLMs on your Pi cluster using QLoRA"
    echo
    echo "Commands:"
    echo "  init                Initialize fine-tuning pipeline"
    echo "  create <name>       Create training dataset interactively"
    echo "  import <file>       Import dataset from JSONL file"
    echo "  finetune <model> <dataset> [name]  Start fine-tuning"
    echo "  quick <file> [persona]  Quick fine-tune from text file"
    echo "  deploy <path> <name>    Deploy model to Ollama"
    echo "  datasets            List training datasets"
    echo "  models              List fine-tuned models"
    echo "  status              Show pipeline status"
    echo
    echo "Examples:"
    echo "  $0 create customer-support"
    echo "  $0 import ~/data/conversations.jsonl"
    echo "  $0 finetune tinyllama customer-support support-bot"
    echo "  $0 quick ~/company-faq.txt company-assistant"
}

# Ensure initialized
[ -d "$FINETUNE_DIR" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    create)
        create_dataset "$2" "$3"
        ;;
    import)
        import_dataset "$2" "$3"
        ;;
    finetune|train)
        finetune "$2" "$3" "$4"
        ;;
    quick|quick-finetune)
        quick_finetune "$2" "$3"
        ;;
    deploy)
        deploy_model "$2" "$3"
        ;;
    datasets|list-datasets)
        list_datasets
        ;;
    models|list-models)
        list_models
        ;;
    status)
        status
        ;;
    *)
        help
        ;;
esac
