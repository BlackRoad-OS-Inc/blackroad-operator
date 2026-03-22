from setuptools import setup, find_packages


setup(
    name="blackroad-agent",
    version="0.1.0",
    packages=find_packages(include=("blackroad_agent", "blackroad_agent.*")),
    install_requires=[
        "click>=8.0",
    ],
    entry_points={
        "console_scripts": [
            "blackroad=blackroad_agent.cli.blackroad:cli",
        ]
    },
)
