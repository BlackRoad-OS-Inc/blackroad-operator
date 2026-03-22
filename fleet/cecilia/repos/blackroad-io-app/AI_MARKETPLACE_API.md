# 🏀 AI MODEL MARKETPLACE API

**Base URL**: `https://blackroad-api.blackroad.workers.dev`

**Date**: December 29, 2025
**Status**: ✅ LIVE & DEPLOYED!

---

## 📊 AI MODELS API

### List All Models
Get all available AI models with NBA 2K-style stats.

**Endpoint**: `GET /api/ai/models`

**Query Parameters**:
- `provider` (optional) - Filter by provider ('anthropic', 'openai', 'meta', 'google', 'mistral')
- `min_rating` (optional) - Minimum overall rating (0-100)

**Response**:
```json
{
  "models": [
    {
      "id": "claude-sonnet-4",
      "name": "Claude Sonnet 4",
      "provider": "anthropic",
      "version": "4.0",
      "stat_intelligence": 98,
      "stat_creativity": 92,
      "stat_speed": 85,
      "stat_cost_efficiency": 88,
      "context_window": 200000,
      "multimodal": true,
      "cap_text": true,
      "cap_code": true,
      "cap_vision": true,
      "cap_audio": false,
      "cap_function_calling": true,
      "cap_streaming": true,
      "price_input": 3.00,
      "price_output": 15.00,
      "has_free_tier": false,
      "overall_rating": 96,
      "user_ratings_count": 0,
      "avg_user_score": 0.0
    }
  ]
}
```

**Example**:
```bash
# Get all models
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models"

# Get only Anthropic models
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models?provider=anthropic"

# Get models with 90+ rating
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models?min_rating=90"
```

### Get Model Details
Get detailed information about a specific model including performance stats.

**Endpoint**: `GET /api/ai/models/:modelId`

**Response**:
```json
{
  "model": {
    "id": "claude-sonnet-4",
    "name": "Claude Sonnet 4",
    "provider": "anthropic",
    "stat_intelligence": 98,
    "stat_creativity": 92,
    "stat_speed": 85,
    "overall_rating": 96
  },
  "performance": {
    "avg_response_time": 1250,
    "avg_cost": 0.05,
    "avg_user_rating": 4.8,
    "total_uses": 15847
  }
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models/claude-sonnet-4"
```

### Compare Two Models
Head-to-head comparison of two AI models.

**Endpoint**: `GET /api/ai/models/compare/:modelId1/:modelId2`

**Response**:
```json
{
  "model1": { ... },
  "model2": { ... },
  "winner": {
    "intelligence": "claude-sonnet-4",
    "creativity": "gpt-4-turbo",
    "speed": "claude-sonnet-4",
    "cost": "claude-sonnet-4",
    "overall": "claude-sonnet-4"
  }
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models/compare/claude-sonnet-4/gpt-4-turbo"
```

---

## 🎨 AGENT BLUEPRINTS API

### List Blueprints
Get user's agent blueprints or public templates.

**Endpoint**: `GET /api/ai/blueprints`

**Query Parameters**:
- `user_id` (optional) - Filter by user
- `public` (optional) - Set to 'true' to get only public blueprints

**Response**:
```json
{
  "blueprints": [
    {
      "id": "template-monetization-expert",
      "name": "💰 Monetization Expert",
      "description": "Business-focused agent that helps with pricing, revenue strategies",
      "base_model_id": "claude-sonnet-4",
      "attr_formality": 65,
      "attr_enthusiasm": 90,
      "attr_creativity": 70,
      "attr_empathy": 75,
      "personality_archetype": "enthusiastic",
      "personality_tone": "professional but excited",
      "emoji_usage": "heavy",
      "feature_web_search": true,
      "feature_code_execution": true,
      "feature_memory_persistence": true,
      "feature_learning_enabled": true,
      "is_public": true,
      "is_template": true
    }
  ]
}
```

**Example**:
```bash
# Get all public blueprints
curl "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints?public=true"

# Get user's blueprints
curl "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints?user_id=user123"
```

### Create Custom Blueprint
Build your own AI agent (NBA 2K style!).

**Endpoint**: `POST /api/ai/blueprints`

**Request Body**:
```json
{
  "userId": "user123",
  "name": "My Custom Agent",
  "description": "A specialized agent for...",
  "baseModelId": "claude-sonnet-4",
  "attributes": {
    "formality": 50,
    "enthusiasm": 85,
    "creativity": 70,
    "empathy": 80
  },
  "personality": {
    "archetype": "friendly",
    "tone": "casual and helpful",
    "emojiUsage": "moderate"
  },
  "features": {
    "webSearch": true,
    "codeExecution": true,
    "memoryPersistence": true,
    "learningEnabled": true
  },
  "customInstructions": "You are a helpful assistant specialized in...",
  "constraints": {
    "maxTokens": 4000,
    "temperature": 0.7,
    "costLimit": 50.0
  }
}
```

**Response**:
```json
{
  "success": true,
  "blueprintId": "blueprint-abc123"
}
```

**Example**:
```bash
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "name": "Code Review Bot",
    "baseModelId": "claude-sonnet-4",
    "attributes": {
      "formality": 80,
      "enthusiasm": 60,
      "creativity": 50,
      "empathy": 70
    }
  }'
```

### Get Blueprint Details
Get specific blueprint with base model info.

**Endpoint**: `GET /api/ai/blueprints/:blueprintId`

**Response**:
```json
{
  "blueprint": { ... },
  "baseModel": {
    "id": "claude-sonnet-4",
    "name": "Claude Sonnet 4",
    "provider": "anthropic"
  }
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints/template-monetization-expert"
```

### Clone a Blueprint
Clone an existing blueprint to customize it.

**Endpoint**: `POST /api/ai/blueprints/:blueprintId/clone`

**Request Body**:
```json
{
  "userId": "user123"
}
```

**Response**:
```json
{
  "success": true,
  "blueprintId": "blueprint-new123"
}
```

**Example**:
```bash
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints/template-code-assistant/clone" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

---

## 🛍️ MARKETPLACE API

### Browse Marketplace
Browse available agent templates.

**Endpoint**: `GET /api/ai/marketplace`

**Query Parameters**:
- `category` (optional) - Filter by category ('business', 'creative', 'technical', 'support')
- `sort_by` (optional) - Sort by 'downloads', 'rating', or 'recent' (default: 'downloads')

**Response**:
```json
{
  "templates": [
    {
      "id": "template-code-assistant",
      "name": "💻 Senior Developer",
      "category": "technical",
      "downloads": 1523,
      "active_instances": 489,
      "avg_rating": 4.9,
      "is_premium": false,
      "price": 0.0,
      "model_name": "GPT-4 Turbo",
      "model_provider": "openai"
    }
  ]
}
```

**Example**:
```bash
# Get all templates sorted by downloads
curl "https://blackroad-api.blackroad.workers.dev/api/ai/marketplace"

# Get technical templates sorted by rating
curl "https://blackroad-api.blackroad.workers.dev/api/ai/marketplace?category=technical&sort_by=rating"

# Get business templates
curl "https://blackroad-api.blackroad.workers.dev/api/ai/marketplace?category=business"
```

### Get Featured Templates
Get top-rated featured templates.

**Endpoint**: `GET /api/ai/marketplace/featured`

**Response**:
```json
{
  "featured": [
    {
      "name": "💻 Senior Developer",
      "downloads": 1523,
      "active_instances": 489,
      "avg_rating": 4.9,
      "category": "technical"
    }
  ]
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/marketplace/featured"
```

---

## 🚀 AGENT INSTANCES API

### Deploy an Agent
Deploy an agent instance from a blueprint.

**Endpoint**: `POST /api/ai/instances`

**Request Body**:
```json
{
  "blueprintId": "template-monetization-expert",
  "userId": "user123",
  "name": "My Monetization Bot"
}
```

**Response**:
```json
{
  "success": true,
  "instanceId": "instance-xyz789"
}
```

**Example**:
```bash
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/instances" \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "template-code-assistant",
    "userId": "user123",
    "name": "My Code Review Bot"
  }'
```

### List User's Instances
Get all deployed agents for a user.

**Endpoint**: `GET /api/ai/instances?user_id=:userId`

**Response**:
```json
{
  "instances": [
    {
      "id": "instance-xyz789",
      "name": "My Monetization Bot",
      "blueprint_name": "💰 Monetization Expert",
      "model_name": "Claude Sonnet 4",
      "model_provider": "anthropic",
      "status": "active",
      "messages_processed": 1247,
      "tokens_used": 89234,
      "cost_incurred": 12.45,
      "user_satisfaction": 4.8
    }
  ]
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/instances?user_id=user123"
```

### Get Instance Stats
Get performance statistics for a deployed agent.

**Endpoint**: `GET /api/ai/instances/:instanceId/stats`

**Response**:
```json
{
  "instance": { ... },
  "stats": {
    "messages_processed": 1247,
    "tokens_used": 89234,
    "cost_incurred": 12.45,
    "avg_response_time_ms": 1250,
    "uptime_percentage": 99.8,
    "user_satisfaction": 4.8,
    "total_ratings": 156
  }
}
```

**Example**:
```bash
curl "https://blackroad-api.blackroad.workers.dev/api/ai/instances/instance-xyz789/stats"
```

---

## 🤖 AI COLLABORATION API

### Request Agent Collaboration
Request another agent to perform a task.

**Endpoint**: `POST /api/ai/collaborate/request`

**Request Body**:
```json
{
  "fromAgentId": "constantine-monetization",
  "toAgentId": "apollo-deployment",
  "action": "deploy",
  "data": {
    "project": "blackroad-io",
    "environment": "production"
  }
}
```

**Response**:
```json
{
  "success": true,
  "taskId": "task-abc123",
  "messageId": "msg-xyz789"
}
```

### Record Learning
Record what an agent learned from an interaction.

**Endpoint**: `POST /api/ai/collaborate/learn`

**Request Body**:
```json
{
  "agentId": "apollo-deployment",
  "eventType": "success",
  "lesson": "Always run database migrations AFTER code deployment"
}
```

**Response**:
```json
{
  "success": true,
  "learningId": "learning-abc123"
}
```

---

## 📈 STATS & COMPARISONS

### Current Model Leaderboard:
1. **Claude Sonnet 4** - 96 overall (Int: 98, Cre: 92, Speed: 85)
2. **GPT-4 Turbo** - 93 overall (Int: 95, Cre: 96, Speed: 82)
3. **Gemini Pro** - 91 overall (Int: 92, Cre: 88, Speed: 90)
4. **Llama 3 70B** - 90 overall (Int: 88, Cre: 85, Speed: 95)
5. **Mistral Large** - 89 overall (Int: 90, Cre: 88, Speed: 92)
6. **Claude Haiku** - 88 overall (Int: 85, Cre: 82, Speed: 98)
7. **GPT-3.5 Turbo** - 85 overall (Int: 82, Cre: 85, Speed: 95)

### Most Popular Templates:
1. **💻 Senior Developer** - 1,523 downloads, 4.9★ (GPT-4 Turbo)
2. **💰 Monetization Expert** - 847 downloads, 4.8★ (Claude Sonnet 4)
3. **✍️ Creative Writer** - 692 downloads, 4.7★ (GPT-4 Turbo)
4. **📊 Data Analyst** - 438 downloads, 4.6★ (Claude Sonnet 4)

---

## 🎮 NBA 2K-STYLE FEATURES

### Model Stats Explained:
- **Intelligence (0-100)**: Reasoning, problem-solving, complex task handling
- **Creativity (0-100)**: Novel ideas, storytelling, artistic tasks
- **Speed (0-100)**: Response time, throughput
- **Cost Efficiency (0-100)**: Value per dollar spent
- **Context Window**: Maximum tokens the model can remember
- **Overall Rating (0-100)**: Combined score from all stats + user feedback

### Agent Attributes:
- **Formality (0-100)**: Casual (0) ↔ Formal (100)
- **Enthusiasm (0-100)**: Calm (0) ↔ Excited (100)
- **Creativity (0-100)**: Factual (0) ↔ Creative (100)
- **Empathy (0-100)**: Logical (0) ↔ Emotional (100)

### Personality Archetypes:
- **Professional**: Serious, business-focused, efficient
- **Friendly**: Warm, approachable, conversational
- **Enthusiastic**: Energetic, excited, motivational
- **Analytical**: Data-driven, precise, scientific
- **Creative**: Artistic, expressive, imaginative

---

## 💡 EXAMPLE USE CASES

### 1. Find Best Model for Creative Writing:
```bash
# Get models sorted by creativity
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models" | \
  jq '.models | sort_by(.stat_creativity) | reverse | .[0]'
```

### 2. Build Custom Code Review Bot:
```bash
# Create blueprint
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "name": "Code Review Bot",
    "baseModelId": "claude-sonnet-4",
    "attributes": {
      "formality": 80,
      "enthusiasm": 40,
      "creativity": 30,
      "empathy": 60
    },
    "personality": {
      "archetype": "analytical",
      "tone": "technical and precise"
    },
    "features": {
      "codeExecution": true,
      "webSearch": true
    }
  }'

# Deploy instance
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/instances" \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "blueprint-abc123",
    "userId": "user123",
    "name": "My Code Reviewer"
  }'
```

### 3. Compare Models for Your Use Case:
```bash
# Compare Claude vs GPT-4
curl "https://blackroad-api.blackroad.workers.dev/api/ai/models/compare/claude-sonnet-4/gpt-4-turbo" | \
  jq '.winner'
```

### 4. Clone and Customize Popular Template:
```bash
# Browse featured templates
curl "https://blackroad-api.blackroad.workers.dev/api/ai/marketplace/featured"

# Clone the Senior Developer template
curl -X POST "https://blackroad-api.blackroad.workers.dev/api/ai/blueprints/template-code-assistant/clone" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

---

**Built by**: Constantine (cecilia-constantine-monetization-specialist)
**Date**: December 29, 2025
**Status**: ✅ FULLY OPERATIONAL!

**This is REVOLUTIONARY! Pick your model, customize everything, deploy instantly!** 🏀🤖
