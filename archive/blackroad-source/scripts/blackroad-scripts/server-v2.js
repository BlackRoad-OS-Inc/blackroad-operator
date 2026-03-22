#!/usr/bin/env node
// BlackRoad Copilot Gateway v2 - Multi-layer routing architecture
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

import { RequestClassifier } from './classifier.js'
import { RouteEngine } from './layers/route-engine.js'

// Initialize components
const classifier = new RequestClassifier()
const routeEngine = new RouteEngine()

// Create MCP server
const server = new Server(
  {
    name: 'blackroad-gateway',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

// Load classifier rules and initialize route engine
await classifier.load()
await routeEngine.initialize()

// Tool: route_request - intelligent routing with multi-layer architecture
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'route_request',
      description: 'Route a request through BlackRoad AI multi-layer architecture. Model name -> API -> Provider -> Instance -> Route -> BlackRoad.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt/request to route'
          },
          intent: {
            type: 'string',
            description: 'Optional: Specify intent (code_generation, debugging, etc.)',
            enum: ['code_generation', 'code_analysis', 'code_refactoring', 'debugging', 'documentation', 'architecture', 'testing', 'general']
          },
          options: {
            type: 'object',
            description: 'Optional: Model-specific options',
            properties: {
              temperature: { type: 'number' },
              max_tokens: { type: 'number' }
            }
          }
        },
        required: ['prompt']
      }
    },
    {
      name: 'list_models',
      description: 'List all available models in BlackRoad AI fleet',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'gateway_stats',
      description: 'Get gateway statistics including routing history, instance health, and performance metrics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'health_check',
      description: 'Check health of all API instances across providers',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}))

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === 'route_request') {
      // Step 1: Classify intent (if not provided)
      let classification
      if (args.intent) {
        // Use provided intent
        const routingRules = classifier.routingRules
        const intentRule = routingRules.intents[args.intent]
        classification = {
          intent: args.intent,
          confidence: 1.0,
          models: intentRule.models,
          description: intentRule.description
        }
      } else {
        // Auto-classify
        classification = await classifier.classify(args.prompt)
      }

      // Step 2-8: Route through multi-layer architecture
      const result = await routeEngine.route(
        {
          prompt: args.prompt,
          options: args.options || {}
        },
        classification
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              routing: {
                intent: classification.intent,
                confidence: classification.confidence,
                model: result.model,
                provider: result.provider,
                instance: result.instance,
                latency: result.latency,
                load: result.load
              },
              response: result.response
            }, null, 2)
          }
        ]
      }
    }

    if (name === 'list_models') {
      const models = []
      for (const model of routeEngine.registry.models) {
        models.push({
          name: model.name,
          provider: model.provider,
          capabilities: model.capabilities,
          priority: model.priority
        })
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              provider: routeEngine.registry.provider,
              models
            }, null, 2)
          }
        ]
      }
    }

    if (name === 'gateway_stats') {
      const stats = routeEngine.getStats()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              stats
            }, null, 2)
          }
        ]
      }
    }

    if (name === 'health_check') {
      const health = await routeEngine.healthCheck()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              instances: health
            }, null, 2)
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }
      ],
      isError: true
    }
  }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)

console.error('🌌 BlackRoad Copilot Gateway v2 running on stdio')
console.error(`🤖 BlackRoad AI endpoint: ${process.env.BLACKROAD_AI_ENDPOINT || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'}`)
console.error('📡 Multi-layer routing: Model -> API -> Provider -> Instance -> Route -> BlackRoad')
console.error('🗺️  Route engine ready with intelligent load balancing')
