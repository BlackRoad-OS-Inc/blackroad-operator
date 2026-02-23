#!/usr/bin/env python3
"""
Fine-tune Qwen 2.5 Coder with LoRA on BlackRoad codebase.

This creates the first BlackRoad proprietary model!

Requirements:
    pip install transformers peft datasets wandb accelerate bitsandbytes

Usage:
    python train.py
    python train.py --dry-run  # Test without actual training
"""
import argparse
import os
import yaml
from pathlib import Path
from datetime import datetime

# Check if dependencies are available
try:
    import torch
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        TrainingArguments,
        Trainer,
        DataCollatorForLanguageModeling
    )
    from peft import LoraConfig, get_peft_model, TaskType
    from datasets import load_dataset
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Missing dependencies: {e}")
    print("\nInstall with:")
    print("  pip install transformers peft datasets wandb accelerate bitsandbytes")
    DEPENDENCIES_AVAILABLE = False


def load_config():
    """Load training configuration."""
    with open('train_config.yaml') as f:
        return yaml.safe_load(f)


def setup_model_and_tokenizer(config):
    """Load base model and tokenizer, apply LoRA."""
    print("📦 Loading base model and tokenizer...")

    base_model_path = config['base_model']['path']

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        base_model_path,
        trust_remote_code=True
    )
    tokenizer.pad_token = tokenizer.eos_token

    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        base_model_path,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True
    )

    # Configure LoRA
    lora_config = LoraConfig(
        r=config['lora']['r'],
        lora_alpha=config['lora']['lora_alpha'],
        lora_dropout=config['lora']['lora_dropout'],
        target_modules=config['lora']['target_modules'],
        bias=config['lora']['bias'],
        task_type=TaskType.CAUSAL_LM
    )

    # Apply LoRA
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    return model, tokenizer


def load_training_data(config, tokenizer):
    """Load and preprocess training data."""
    print("📊 Loading training data...")

    # For now, use a placeholder dataset
    # In production, this would load from S3
    print("⚠️  Using placeholder data (production would use S3)")

    # Placeholder: Load a small code dataset
    dataset = load_dataset("code_search_net", "python", split="train[:1000]")

    def preprocess_function(examples):
        """Tokenize examples."""
        return tokenizer(
            examples['func_code_string'],
            truncation=True,
            max_length=config['data']['max_length'],
            padding='max_length'
        )

    tokenized_dataset = dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=dataset.column_names
    )

    return tokenized_dataset


def train(config, model, tokenizer, dataset, dry_run=False):
    """Run training."""
    print("🚀 Starting training...")

    # Training arguments
    training_args = TrainingArguments(
        output_dir=config['output']['output_dir'],
        num_train_epochs=config['training']['num_train_epochs'],
        per_device_train_batch_size=config['training']['per_device_train_batch_size'],
        gradient_accumulation_steps=config['training']['gradient_accumulation_steps'],
        learning_rate=config['training']['learning_rate'],
        weight_decay=config['training']['weight_decay'],
        logging_steps=config['training']['logging_steps'],
        save_steps=config['training']['save_steps'],
        save_total_limit=config['training']['save_total_limit'],
        fp16=config['training']['fp16'],
        gradient_checkpointing=config['training']['gradient_checkpointing'],
        warmup_ratio=config['training']['warmup_ratio'],
        lr_scheduler_type=config['training']['lr_scheduler'],
        logging_dir=config['training']['logging_dir'],
        report_to=config['training']['report_to'],
        seed=config['training']['seed'],
    )

    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Causal LM, not masked LM
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=data_collator,
    )

    if dry_run:
        print("✅ Dry run complete - training setup validated!")
        print("\nTo run actual training:")
        print("  python train.py")
        return

    # Train!
    print("\n🔥 Training starting...")
    print(f"  Epochs: {config['training']['num_train_epochs']}")
    print(f"  Batch size: {config['training']['per_device_train_batch_size']}")
    print(f"  Learning rate: {config['training']['learning_rate']}")
    print(f"  LoRA rank: {config['lora']['r']}")

    trainer.train()

    # Save final model
    output_path = Path(config['output']['output_dir']) / config['output']['final_model_name']
    trainer.save_model(output_path)

    print(f"\n✅ Training complete!")
    print(f"📦 Model saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Train blackroad-coder-lora")
    parser.add_argument('--dry-run', action='store_true', help='Test setup without training')
    args = parser.parse_args()

    print("=" * 60)
    print("🚀 BlackRoad Coder LoRA Training")
    print("=" * 60)

    # Load config
    config = load_config()
    print("\n✅ Configuration loaded")
    print(f"  Base model: {config['base_model']['name']}")
    print(f"  LoRA rank: {config['lora']['r']}")
    print(f"  Epochs: {config['training']['num_train_epochs']}")

    if not DEPENDENCIES_AVAILABLE:
        print("\n❌ Cannot proceed - missing dependencies")
        print("\nInstall with:")
        print("  pip install transformers peft datasets wandb accelerate bitsandbytes")
        return 1

    # Check GPU
    if not torch.cuda.is_available():
        print("\n⚠️  Warning: No GPU detected!")
        print("  Training will be very slow on CPU")
        print("  Recommended: Use A100 GPU (4-8 hours)")
        if not args.dry_run:
            response = input("\nContinue anyway? (y/N): ")
            if response.lower() != 'y':
                return 1

    # Setup
    model, tokenizer = setup_model_and_tokenizer(config)
    dataset = load_training_data(config, tokenizer)

    # Train
    train(config, model, tokenizer, dataset, dry_run=args.dry_run)

    print("\n" + "=" * 60)
    print("✅ Done!")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    if not DEPENDENCIES_AVAILABLE:
        print("\n📝 Training script created (dependencies not installed yet)")
        print("\nTo run training:")
        print("  1. Install dependencies:")
        print("     pip install transformers peft datasets wandb accelerate bitsandbytes")
        print("  2. Run training:")
        print("     python train.py")
        print("  3. Or dry-run test:")
        print("     python train.py --dry-run")
        exit(0)
    else:
        exit(main())
