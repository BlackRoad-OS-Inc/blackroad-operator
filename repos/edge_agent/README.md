# Edge Agent

An opinionated starter agent that captures frames from a camera, computes
operational vitals, derives an overall trust score, and sends the data to the
BlackRoad Island Gateway.

## Features

- OpenCV-based frame capture with graceful fallback when the camera is not
  available.
- Lightweight vitals heuristics measuring confidence, transparency, and
  stability per frame.
- Trust computation with configurable weights and an emit gate that protects the
  gateway from noisy data.
- JSON payload sender that can optionally include JPEG frame captures.
- Ready-to-use Dockerfiles for CPU development and Jetson deployments.

## Local development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GATEWAY_URL="http://127.0.0.1:8080"
export AGENT_ID="edge-demo-01"
python -m edge_agent
```

## Docker

CPU image:

```bash
docker build -f Dockerfile.cpu -t edge-agent:dev .
docker run --rm --net=host \ 
  -e GATEWAY_URL=http://127.0.0.1:8080 \ 
  -e AGENT_ID=edge-demo-01 \ 
  edge-agent:dev
```

Jetson (GPU) image:

```bash
docker build -f Dockerfile.jetson -t ghcr.io/<org>/edge-agent:latest .
docker run --rm --runtime nvidia --gpus all --net=host \ 
  -e GATEWAY_URL=http://<gateway-ip>:8080 \ 
  -e AGENT_ID=jetson-orin-01 \ 
  ghcr.io/<org>/edge-agent:latest
```

## Configuration

Runtime behaviour is controlled via environment variables. See
[`.env.example`](./.env.example) for the full list.
