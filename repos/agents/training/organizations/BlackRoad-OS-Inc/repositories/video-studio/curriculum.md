# video-studio — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Video editor with timeline editing, AI auto-captions, and effects. Motion library system for animations and transitions. BlackRoad's creator-focused video tool.

## Key Files

- `src/motion_library.py` — Animation and motion effects library
- `tests/test_motion.py` — Motion library tests

## Learning Objectives

1. Understand the purpose and architecture of video-studio
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `motion_library.py` and list all available effects
- [ ] Understand the animation keyframe model
- [ ] Run tests and verify all effects work

### Level 2: Contributor
- [ ] Add a new motion effect
- [ ] Improve easing functions
- [ ] Add a test for edge cases (zero duration, etc.)

### Level 3: Builder
- [ ] Build a timeline rendering engine
- [ ] Add AI auto-captioning via Ollama
- [ ] Implement video export

### Level 4: Architect
- [ ] Design a plugin system for custom effects
- [ ] Propose real-time preview architecture
- [ ] Review video codec requirements
