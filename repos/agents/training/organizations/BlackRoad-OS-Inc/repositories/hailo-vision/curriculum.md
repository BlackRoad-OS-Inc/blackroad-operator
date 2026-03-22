# hailo-vision — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Real-time computer vision on Hailo-8 AI accelerators (26 TOPS each). YOLOv5 object detection, video analytics, and edge inference pipelines on Raspberry Pi 5. Two Hailo-8 chips on Cecilia + Octavia = 52 TOPS total.

## Key Files

- `server.py` — FastAPI: camera input, Hailo inference, detection results, video stream
- `tests/test_server.py` — Tests
- `deploy.sh` — Pi deployment

## Learning Objectives

1. Understand the purpose and architecture of hailo-vision
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `server.py` and understand the inference pipeline
- [ ] Identify which models run on Hailo-8 vs CPU
- [ ] Describe the video frame processing flow

### Level 2: Contributor
- [ ] Add a new detection class to the model
- [ ] Improve bounding box visualization
- [ ] Add a test for the inference pipeline

### Level 3: Builder
- [ ] Add multi-camera support
- [ ] Implement object tracking across frames
- [ ] Add a REST API for triggering captures

### Level 4: Architect
- [ ] Design a distributed vision pipeline across both Hailo chips
- [ ] Propose a model fine-tuning workflow
- [ ] Review inference latency optimization
