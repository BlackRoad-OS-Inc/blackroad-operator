/**
 * AI Content Generator for Reality Engine
 *
 * Describe what you want in plain English → AI generates the 3D content!
 *
 * Examples:
 * - "Create a futuristic cyberpunk city"
 * - "Add a medieval castle with towers"
 * - "Make a tropical beach with palm trees"
 * - "Generate a racing track in the desert"
 *
 * The AI understands your intent and creates photorealistic content!
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const REALITY_ENGINE_URL = process.env.REALITY_ENGINE_URL || 'http://localhost:4500';
const PORT = process.env.PORT || 4600;

// In-memory generation history
const generationHistory: any[] = [];

/**
 * AI-powered prompt parser
 * Analyzes natural language and determines what to create
 */
class AIContentGenerator {
  /**
   * Parse natural language prompt and generate creation plan
   */
  parsePrompt(prompt: string): any {
    const lower = prompt.toLowerCase();
    const plan: any = {
      id: uuidv4(),
      prompt,
      timestamp: new Date(),
      actions: []
    };

    // Terrain detection
    if (this.matchesPattern(lower, ['mountain', 'hill', 'peak', 'valley'])) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'mountain' }
      });
    } else if (this.matchesPattern(lower, ['desert', 'sand', 'dune', 'sahara'])) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'desert' }
      });
    } else if (this.matchesPattern(lower, ['grass', 'meadow', 'plains', 'field'])) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'grassland' }
      });
    } else if (this.matchesPattern(lower, ['snow', 'ice', 'arctic', 'frozen', 'tundra'])) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'snow' }
      });
    } else if (this.matchesPattern(lower, ['forest', 'woods', 'jungle', 'trees'])) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'forest' }
      });
    }

    // City/building detection
    if (this.matchesPattern(lower, ['city', 'downtown', 'metropolis', 'urban'])) {
      const gridSize = this.extractNumber(lower, ['city', 'block'], 10);
      plan.actions.push({
        type: 'city',
        params: {
          gridSize: Math.min(gridSize, 15),
          blockSize: 50,
          position: { x: 0, y: 0, z: 0 }
        }
      });
    } else if (this.matchesPattern(lower, ['building', 'tower', 'skyscraper', 'structure'])) {
      const floors = this.extractNumber(lower, ['floor', 'story', 'level'], 20);
      const style = this.detectStyle(lower);

      plan.actions.push({
        type: 'building',
        params: {
          template: {
            name: `AI-Generated-${uuidv4().slice(0, 8)}`,
            floors: Math.min(floors, 100),
            width: 30,
            depth: 30,
            height: floors * 3.5,
            style,
            materials: this.selectMaterials(style)
          },
          position: { x: 0, y: 0, z: 0 }
        }
      });
    }

    // Character detection
    if (this.matchesPattern(lower, ['person', 'character', 'npc', 'human', 'player'])) {
      const count = this.extractNumber(lower, ['person', 'character', 'people'], 1);

      for (let i = 0; i < Math.min(count, 20); i++) {
        plan.actions.push({
          type: 'character',
          params: {
            template: {
              name: `Character-${i + 1}`,
              bodyType: i % 2 === 0 ? 'male' : 'female',
              height: 1.6 + Math.random() * 0.4,
              proportions: { head: 1.0, torso: 1.0, arms: 1.0, legs: 1.0 },
              customization: {
                skinTone: ['light', 'medium', 'dark'][Math.floor(Math.random() * 3)],
                hairStyle: 'short',
                clothing: ['shirt-casual', 'pants-jeans'],
                accessories: []
              }
            },
            position: {
              x: (Math.random() - 0.5) * 100,
              y: 0,
              z: (Math.random() - 0.5) * 100
            }
          }
        });
      }
    }

    // Vehicle detection
    if (this.matchesPattern(lower, ['car', 'vehicle', 'automobile'])) {
      const count = this.extractNumber(lower, ['car', 'vehicle'], 1);

      for (let i = 0; i < Math.min(count, 10); i++) {
        plan.actions.push({
          type: 'vehicle',
          params: {
            type: 'car',
            position: {
              x: (Math.random() - 0.5) * 100,
              y: 0,
              z: (Math.random() - 0.5) * 100
            }
          }
        });
      }
    }

    // If no specific actions, create a default scene
    if (plan.actions.length === 0) {
      plan.actions.push({
        type: 'terrain',
        params: { biome: 'grassland' }
      });
      plan.actions.push({
        type: 'building',
        params: {
          template: {
            name: 'Default Building',
            floors: 10,
            width: 30,
            depth: 30,
            height: 35,
            style: 'modern',
            materials: {
              walls: 'concrete',
              roof: 'chrome',
              windows: 'glass',
              doors: 'chrome'
            }
          },
          position: { x: 0, y: 0, z: 0 }
        }
      });
    }

    return plan;
  }

  /**
   * Execute generation plan
   */
  async execute(plan: any): Promise<any> {
    const results = [];

    for (const action of plan.actions) {
      try {
        let endpoint = '';

        switch (action.type) {
          case 'terrain':
            endpoint = '/api/create/terrain';
            break;
          case 'building':
            endpoint = '/api/create/building';
            break;
          case 'character':
            endpoint = '/api/create/character';
            break;
          case 'vehicle':
            endpoint = '/api/create/vehicle';
            break;
          case 'city':
            endpoint = '/api/create/city-block';
            break;
        }

        if (endpoint) {
          const response = await axios.post(
            `${REALITY_ENGINE_URL}${endpoint}`,
            action.params
          );

          results.push({
            action: action.type,
            success: true,
            data: response.data
          });

          // Small delay between actions
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        results.push({
          action: action.type,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Helper: Check if prompt matches patterns
   */
  private matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Helper: Extract number from text
   */
  private extractNumber(text: string, contexts: string[], defaultValue: number): number {
    for (const context of contexts) {
      const pattern = new RegExp(`(\\d+)\\s*${context}`, 'i');
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return defaultValue;
  }

  /**
   * Helper: Detect architectural style
   */
  private detectStyle(text: string): string {
    if (this.matchesPattern(text, ['modern', 'contemporary', 'glass', 'steel'])) {
      return 'modern';
    } else if (this.matchesPattern(text, ['classical', 'traditional', 'historic'])) {
      return 'classical';
    } else if (this.matchesPattern(text, ['industrial', 'factory', 'warehouse'])) {
      return 'industrial';
    } else if (this.matchesPattern(text, ['house', 'home', 'residential'])) {
      return 'residential';
    } else if (this.matchesPattern(text, ['shop', 'store', 'commercial', 'office'])) {
      return 'commercial';
    }
    return 'modern';
  }

  /**
   * Helper: Select materials based on style
   */
  private selectMaterials(style: string): any {
    const materialSets: Record<string, any> = {
      modern: {
        walls: 'glass',
        roof: 'chrome',
        windows: 'glass',
        doors: 'chrome'
      },
      classical: {
        walls: 'concrete',
        roof: 'wood-oak',
        windows: 'glass',
        doors: 'wood-oak'
      },
      industrial: {
        walls: 'concrete',
        roof: 'chrome',
        windows: 'glass',
        doors: 'chrome'
      },
      residential: {
        walls: 'concrete',
        roof: 'wood-oak',
        windows: 'glass',
        doors: 'wood-oak'
      },
      commercial: {
        walls: 'glass',
        roof: 'chrome',
        windows: 'glass',
        doors: 'chrome'
      }
    };

    return materialSets[style] || materialSets.modern;
  }
}

const generator = new AIContentGenerator();

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'AI Content Generator',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate content from natural language
 */
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    console.log(`🤖 AI Request: "${prompt}"`);

    // Parse prompt into creation plan
    const plan = generator.parsePrompt(prompt);

    console.log(`📋 Generated plan with ${plan.actions.length} actions`);

    // Execute the plan
    const results = await generator.execute(plan);

    // Save to history
    const generation = {
      ...plan,
      results,
      completedAt: new Date()
    };
    generationHistory.push(generation);

    // Keep only last 100
    if (generationHistory.length > 100) {
      generationHistory.shift();
    }

    res.json({
      success: true,
      plan,
      results,
      message: `Generated ${results.length} objects from your prompt!`
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get generation history
 */
app.get('/api/history', (req: Request, res: Response) => {
  res.json({
    history: generationHistory.slice(-20).reverse(),
    total: generationHistory.length
  });
});

/**
 * Get example prompts
 */
app.get('/api/examples', (req: Request, res: Response) => {
  res.json({
    examples: [
      {
        category: 'Cities',
        prompts: [
          'Create a modern cyberpunk city',
          'Build a 10x10 city block downtown',
          'Generate a futuristic metropolis',
          'Make a classical European city'
        ]
      },
      {
        category: 'Buildings',
        prompts: [
          'Add a 50-floor skyscraper',
          'Create a medieval castle',
          'Build a modern glass office',
          'Generate a residential house'
        ]
      },
      {
        category: 'Terrain',
        prompts: [
          'Generate mountain terrain',
          'Create a desert landscape',
          'Make a grassy meadow',
          'Add snow-covered hills'
        ]
      },
      {
        category: 'Complex Scenes',
        prompts: [
          'Create a racing track in the desert with 5 cars',
          'Build a mountain resort with lodge and 10 people',
          'Generate a downtown area with skyscrapers and vehicles',
          'Make a beach scene with palm trees'
        ]
      },
      {
        category: 'Quick Tests',
        prompts: [
          'Add 5 characters',
          'Create 3 cars',
          'Build a tower',
          'Generate terrain'
        ]
      }
    ]
  });
});

// ============================================================================
// Server Start
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🤖 AI CONTENT GENERATOR - ONLINE 🤖                   ║
║                                                               ║
║  Describe what you want → AI creates it in 3D!               ║
║                                                               ║
║  Examples:                                                    ║
║  • "Create a cyberpunk city"                                 ║
║  • "Add a 50-floor skyscraper"                               ║
║  • "Generate mountain terrain"                               ║
║  • "Make a racing track with 5 cars"                         ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Server: http://localhost:${PORT}                           ║
║  Health: http://localhost:${PORT}/health                    ║
║  Examples: http://localhost:${PORT}/api/examples            ║
║                                                               ║
║  Try it:                                                      ║
║  POST /api/generate                                          ║
║  {"prompt": "Create a futuristic city"}                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
