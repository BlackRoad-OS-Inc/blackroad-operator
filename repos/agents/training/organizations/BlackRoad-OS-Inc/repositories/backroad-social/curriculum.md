# backroad-social — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Social platform for depth over engagement. Chronological feeds, no ads, creator-owned content. Includes Bluesky and Mastodon cross-posting bots. BackRoad is BlackRoad's answer to social media — built on the principle that people deserve better than algorithmic feeds.

## Key Files

- `src/social_media_api.py` — Core social API
- `bots/bluesky_bot.py` — Bluesky cross-posting bot
- `bots/mastodon_bot.py` — Mastodon cross-posting bot
- `tests/test_social_media_api.py` — API tests

## Learning Objectives

1. Understand the purpose and architecture of backroad-social
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `src/social_media_api.py` and list all endpoints
- [ ] Explain the chronological feed algorithm (hint: there isn't one)
- [ ] Read bot code and understand cross-posting flow

### Level 2: Contributor
- [ ] Add input validation to post creation
- [ ] Add a test for the Bluesky bot
- [ ] Fix any error handling gaps in the API

### Level 3: Builder
- [ ] Add a content moderation system
- [ ] Implement user blocking and muting
- [ ] Add media upload support

### Level 4: Architect
- [ ] Design federation support (ActivityPub)
- [ ] Propose a content recommendation system that respects user agency
- [ ] Review privacy model
