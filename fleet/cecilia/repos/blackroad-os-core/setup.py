#!/usr/bin/env python3
"""
BlackRoad OS Core - Main Python Package
Setup for agent infrastructure, LLM integration, and marketplace
"""
from setuptools import setup, find_packages
from pathlib import Path

# Read README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text() if readme_file.exists() else ""

setup(
    name="blackroad-os-core",
    version="0.1.0",
    description="BlackRoad OS Core - Agent infrastructure and orchestration",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="BlackRoad OS",
    author_email="blackroad.systems@gmail.com",
    url="https://github.com/blackroad-os/blackroad-os-core",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.10",
    install_requires=[
        "pydantic>=2.8.2",
        "pyyaml>=6.0.2",
        "requests>=2.32.3",
        "fastapi>=0.115.0",
        "uvicorn>=0.30.0",
        "aiohttp>=3.10.0",
        "httpx>=0.27.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
        ],
        "llm": [
            "transformers>=4.30.0",
            "torch>=2.0.0",
        ],
        "all": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "transformers>=4.30.0",
            "torch>=2.0.0",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Programming Language :: Python :: 3.14",
    ],
    entry_points={
        "console_scripts": [
            "blackroad=blackroad_core.cli:main",
        ],
    },
)
