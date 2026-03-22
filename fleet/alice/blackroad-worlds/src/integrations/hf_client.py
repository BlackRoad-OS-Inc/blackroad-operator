"""
BlackRoad HuggingFace Client
Upload models, create Spaces, and query the Hub API.
"""
from __future__ import annotations
import os, json, logging
from pathlib import Path
from typing import Any, Optional
from huggingface_hub import (
    HfApi, InferenceClient, create_repo,
    hf_hub_download, snapshot_download,
    login, whoami,
)

logger = logging.getLogger("blackroad.hf")

HF_ORG = os.getenv("HF_ORG", "blackroad-os")
HF_TOKEN = os.getenv("HF_TOKEN", "")


def authenticate(token: Optional[str] = None) -> str:
    """Login to HuggingFace Hub and return username."""
    t = token or HF_TOKEN
    if not t:
        raise ValueError("HF_TOKEN env var not set")
    login(token=t)
    info = whoami(token=t)
    logger.info("Logged in as: %s", info["name"])
    return info["name"]


class BlackRoadHFClient:
    """High-level HuggingFace Hub client for BlackRoad models."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or HF_TOKEN
        self.api = HfApi(token=self.token)
        self.inference = InferenceClient(token=self.token) if self.token else None

    # ──────────────────────────────────────────────
    # Model Management
    # ──────────────────────────────────────────────

    def push_model(
        self,
        local_path: str | Path,
        model_id: str,
        *,
        private: bool = False,
        tags: list[str] | None = None,
    ) -> str:
        """Push a local model directory to the Hub."""
        create_repo(
            model_id, repo_type="model",
            private=private, exist_ok=True, token=self.token
        )
        self.api.upload_folder(
            folder_path=str(local_path),
            repo_id=model_id,
            repo_type="model",
        )
        logger.info("✓ Model pushed: https://huggingface.co/%s", model_id)
        return f"https://huggingface.co/{model_id}"

    def download_model(
        self,
        model_id: str,
        cache_dir: Optional[str] = None,
        revision: str = "main",
    ) -> str:
        """Download a model snapshot to local cache."""
        path = snapshot_download(
            model_id,
            revision=revision,
            cache_dir=cache_dir or os.path.expanduser("~/.cache/huggingface/hub"),
            token=self.token,
        )
        logger.info("✓ Downloaded to: %s", path)
        return path

    def list_models(self, org: Optional[str] = None) -> list[dict]:
        """List models for an org."""
        org = org or HF_ORG
        models = list(self.api.list_models(author=org))
        return [{"id": m.id, "likes": m.likes, "downloads": m.downloads} for m in models]

    # ──────────────────────────────────────────────
    # Spaces
    # ──────────────────────────────────────────────

    def create_space(
        self,
        space_id: str,
        *,
        sdk: str = "gradio",
        private: bool = False,
        hardware: str = "cpu-basic",
    ) -> str:
        """Create a HuggingFace Space."""
        create_repo(
            space_id, repo_type="space",
            space_sdk=sdk, private=private,
            exist_ok=True, token=self.token
        )
        url = f"https://huggingface.co/spaces/{space_id}"
        logger.info("✓ Space ready: %s", url)
        return url

    def push_space(self, local_path: str | Path, space_id: str) -> str:
        """Upload a directory to a HuggingFace Space."""
        self.api.upload_folder(
            folder_path=str(local_path),
            repo_id=space_id,
            repo_type="space",
        )
        url = f"https://huggingface.co/spaces/{space_id}"
        logger.info("✓ Space updated: %s", url)
        return url

    # ──────────────────────────────────────────────
    # Inference
    # ──────────────────────────────────────────────

    def chat(
        self,
        prompt: str,
        model: str = "mistralai/Mistral-7B-Instruct-v0.2",
        max_tokens: int = 512,
    ) -> str:
        """Chat with any HF Inference API model."""
        if not self.inference:
            raise ValueError("No HF_TOKEN set for inference")
        response = self.inference.text_generation(
            prompt, model=model,
            max_new_tokens=max_tokens,
        )
        return response

    def embed(
        self,
        texts: list[str],
        model: str = "sentence-transformers/all-MiniLM-L6-v2",
    ) -> list[list[float]]:
        """Compute embeddings via HF Inference API."""
        if not self.inference:
            raise ValueError("No HF_TOKEN set for inference")
        return self.inference.feature_extraction(texts, model=model)

    # ──────────────────────────────────────────────
    # Datasets
    # ──────────────────────────────────────────────

    def push_dataset(
        self,
        local_path: str | Path,
        dataset_id: str,
        *,
        private: bool = True,
    ) -> str:
        """Push a local dataset directory to Hub."""
        create_repo(
            dataset_id, repo_type="dataset",
            private=private, exist_ok=True, token=self.token
        )
        self.api.upload_folder(
            folder_path=str(local_path),
            repo_id=dataset_id,
            repo_type="dataset",
        )
        return f"https://huggingface.co/datasets/{dataset_id}"


def main():
    """CLI entry point."""
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad HuggingFace CLI")
    parser.add_argument("command", choices=["list", "push", "download", "space", "chat"])
    parser.add_argument("--model", default="blackroad-os/blackroad-agents")
    parser.add_argument("--path", default=".")
    parser.add_argument("--prompt", default="Hello! What can you do?")
    args = parser.parse_args()

    client = BlackRoadHFClient()

    if args.command == "list":
        models = client.list_models()
        for m in models:
            print(f"  {m['id']:50} ↓{m['downloads']:,} ♥{m['likes']}")
    elif args.command == "push":
        url = client.push_model(args.path, args.model)
        print(f"✓ {url}")
    elif args.command == "download":
        path = client.download_model(args.model)
        print(f"✓ {path}")
    elif args.command == "space":
        url = client.create_space(args.model)
        print(f"✓ {url}")
    elif args.command == "chat":
        response = client.chat(args.prompt)
        print(response)


if __name__ == "__main__":
    main()
