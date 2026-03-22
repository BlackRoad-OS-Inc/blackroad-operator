#!/usr/bin/env node
// Lucidia Configuration Manager
// Loads, validates, and manages config.yaml

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const os = require('os');

const LUCIDIA_DIR = path.join(os.homedir(), '.lucidia');
const CONFIG_PATH = path.join(LUCIDIA_DIR, 'config.yaml');
const MODELS_PATH = path.join(LUCIDIA_DIR, 'models.yaml');

class Config {
  constructor() {
    this.config = null;
    this.models = null;
    this.load();
  }

  // Load configuration
  load() {
    try {
      // Load main config
      if (fs.existsSync(CONFIG_PATH)) {
        const content = fs.readFileSync(CONFIG_PATH, 'utf8');
        this.config = yaml.load(content);
      } else {
        throw new Error('Config file not found');
      }

      // Load models config
      if (fs.existsSync(MODELS_PATH)) {
        const content = fs.readFileSync(MODELS_PATH, 'utf8');
        this.models = yaml.load(content);
      } else {
        throw new Error('Models config not found');
      }

      this.validate();
    } catch (err) {
      console.error('Error loading config:', err.message);
      process.exit(1);
    }
  }

  // Validate configuration
  validate() {
    const required = ['version', 'daemon', 'models', 'multi_model'];
    for (const key of required) {
      if (!this.config[key]) {
        throw new Error(`Missing required config: ${key}`);
      }
    }
  }

  // Get config value with dot notation
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  // Set config value
  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj)) {
        obj[k] = {};
      }
      obj = obj[k];
    }
    
    obj[keys[keys.length - 1]] = value;
    this.save();
  }

  // Save configuration
  save() {
    try {
      const content = yaml.dump(this.config);
      fs.writeFileSync(CONFIG_PATH, content, 'utf8');
    } catch (err) {
      console.error('Error saving config:', err.message);
    }
  }

  // Get model configuration
  getModel(name) {
    const models = this.config.models;
    return models[name] || null;
  }

  // Get routing rules
  getRouting() {
    return this.models.routing || [];
  }

  // Hot reload
  reload() {
    this.load();
  }
}

module.exports = Config;
