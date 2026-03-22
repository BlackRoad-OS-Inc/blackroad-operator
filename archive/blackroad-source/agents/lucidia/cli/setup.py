from setuptools import setup, find_packages

setup(
    name="lucidia-cli",
    version="0.7.0",
    packages=find_packages(),
    py_modules=["lucidia"],
    install_requires=[
        "rich>=13.0",
        "textual>=0.40",
    ],
    entry_points={
        "console_scripts": [
            "lucidia=lucidia:main",
        ],
    },
    author="Alexa Amundson",
    author_email="alexa@blackroad.io",
    description="Terminal OS for BlackRoad",
    python_requires=">=3.10",
)
