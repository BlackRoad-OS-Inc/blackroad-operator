from setuptools import setup, find_packages

setup(
    name="lucidia-psi",
    version="0.1.0",
    packages=["lucidia_psi"],
    entry_points={
        "console_scripts": [
            "lucidia=lucidia_psi.cli:main",
        ],
    },
    python_requires=">=3.10",
    author="Alexa Amundson",
    description="Paraconsistent memory system for Lucidia AI",
)
