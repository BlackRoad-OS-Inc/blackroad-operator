#!/usr/bin/env node
// Lucidia Multi-Model Orchestrator
// Routes tasks to appropriate models and manages parallel execution

const axios = require('axios');

const OLLAMA_API = 'http://localhost:11434';

class Orchestrator {
  constructor(config) {
    this.config = config;
  }

  // Route task to appropriate model(s)
  async route(prompt) {
    const routing = this.config.getRouting();
    const promptLower = prompt.toLowerCase();

    // Find matching route
    for (const rule of routing) {
      const pattern = new RegExp(rule.pattern, 'i');
      if (pattern.test(promptLower)) {
        return {
          models: rule.models,
          parallel: rule.parallel
        };
      }
    }

    // Default: use code model
    return {
      models: ['code'],
      parallel: false
    };
  }

  // Execute task with single model (with streaming support)
  async executeTask(prompt, modelName = null, stream = false, onChunk = null) {
    const model = modelName || this.config.get('default_model');
    const modelConfig = this.config.getModel(modelName || 'code');

    const startTime = Date.now();

    try {
      if (stream && onChunk) {
        // Streaming mode
        return await this.executeStreaming(prompt, modelConfig ? modelConfig.name : model, onChunk);
      }

      // Non-streaming mode (original)
      const response = await axios.post(`${OLLAMA_API}/api/generate`, {
        model: modelConfig ? modelConfig.name : model,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: modelConfig ? modelConfig.max_tokens : 4096
        }
      });

      const endTime = Date.now();

      return {
        model: modelConfig ? modelConfig.name : model,
        role: modelName || 'code',
        response: response.data.response,
        reasoning: modelConfig ? modelConfig.purpose : 'default model',
        time: (endTime - startTime) / 1000,
        tokens: response.data.eval_count || 0,
        created: new Date().toISOString()
      };
    } catch (err) {
      return {
        model: modelConfig ? modelConfig.name : model,
        role: modelName || 'code',
        error: err.message,
        time: (Date.now() - startTime) / 1000,
        created: new Date().toISOString()
      };
    }
  }

  // Execute task with multiple models (index-first)
  async collaborate(prompt, modelNames = null) {
    // Route if no models specified
    let models = modelNames;
    let parallel = true;

    if (!models) {
      const route = await this.route(prompt);
      models = route.models;
      parallel = route.parallel;
    }

    // Execute in parallel or sequential
    if (parallel && models.length > 1) {
      const promises = models.map(m => this.executeTask(prompt, m));
      const results = await Promise.all(promises);
      return {
        task: prompt,
        models: results,
        selected: null,
        parallel: true,
        created: new Date().toISOString()
      };
    } else {
      const results = [];
      for (const model of models) {
        const result = await this.executeTask(prompt, model);
        results.push(result);
      }
      return {
        task: prompt,
        models: results,
        selected: null,
        parallel: false,
        created: new Date().toISOString()
      };
    }
  }

  // Format results for display
  formatResults(results, display = 'side-by-side') {
    if (display === 'side-by-side') {
      return this.formatSideBySide(results);
    } else if (display === 'sequential') {
      return this.formatSequential(results);
    } else {
      return this.formatTabs(results);
    }
  }

  formatSideBySide(results) {
    let output = `\n╔════════════════════════════════════════════════════════╗\n`;
    output += `║  📊 Multi-Model Results (${results.models.length} models)              ║\n`;
    output += `╚════════════════════════════════════════════════════════╝\n\n`;

    for (let i = 0; i < results.models.length; i++) {
      const model = results.models[i];
      output += `┌─────────────────────────────────────────────────────────┐\n`;
      output += `│  Model ${i + 1}: ${model.model.padEnd(42)} │\n`;
      output += `│  Role: ${model.role.padEnd(46)} │\n`;
      output += `│  Time: ${model.time.toFixed(2)}s${' '.repeat(45 - model.time.toFixed(2).length)} │\n`;
      output += `└─────────────────────────────────────────────────────────┘\n\n`;
      
      if (model.error) {
        output += `❌ Error: ${model.error}\n\n`;
      } else {
        output += `${model.response}\n\n`;
      }
    }

    return output;
  }

  formatSequential(results) {
    let output = '';
    for (let i = 0; i < results.models.length; i++) {
      const model = results.models[i];
      output += `\n═══ Model ${i + 1}: ${model.model} ═══\n`;
      output += model.error ? `Error: ${model.error}\n` : `${model.response}\n`;
    }
    return output;
  }

  formatTabs(results) {
    // For web UI
    return results;
  }
}

module.exports = Orchestrator;

  // Execute with streaming (character-by-character output)
  async executeStreaming(prompt, modelName, onChunk) {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      let fullResponse = '';
      
      try {
        const response = await axios.post(`${OLLAMA_API}/api/generate`, {
          model: modelName,
          prompt: prompt,
          stream: true,
        }, {
          responseType: 'stream'
        });

        response.data.on('data', (chunk) => {
          try {
            const lines = chunk.toString().split('\n').filter(line => line.trim());
            for (const line of lines) {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                onChunk(data.response); // Send each character to callback
              }
              if (data.done) {
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                resolve({
                  model: modelName,
                  response: fullResponse,
                  time: duration,
                  tokens: data.eval_count || fullResponse.split(' ').length
                });
              }
            }
          } catch (e) {
            // Skip invalid JSON chunks
          }
        });

        response.data.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
