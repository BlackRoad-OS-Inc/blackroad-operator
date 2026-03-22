/**
 * 🎓 BlackRoad OS Education Pack
 * Entry point for accessing schemas, flows, templates, and agents
 */

const fs = require('fs');
const path = require('path');

/**
 * Load all schemas
 */
function loadSchemas() {
  const schemasDir = path.join(__dirname, 'schemas');
  const schemas = {};
  
  try {
    const files = fs.readdirSync(schemasDir);
    files
      .filter(f => f.endsWith('.schema.json'))
      .forEach(file => {
        const name = file.replace('.schema.json', '');
        try {
          schemas[name] = require(path.join(schemasDir, file));
        } catch (error) {
          console.error(`Warning: Could not load schema ${file}:`, error.message);
        }
      });
  } catch (error) {
    console.error('Warning: Could not read schemas directory:', error.message);
  }
  
  return schemas;
}

/**
 * Load all flows
 */
function loadFlows() {
  const flowsDir = path.join(__dirname, 'flows');
  const flows = {};
  
  try {
    const files = fs.readdirSync(flowsDir);
    files
      .filter(f => f.endsWith('.flow.json'))
      .forEach(file => {
        try {
          const flow = require(path.join(flowsDir, file));
          flows[flow.flowId] = flow;
        } catch (error) {
          console.error(`Warning: Could not load flow ${file}:`, error.message);
        }
      });
  } catch (error) {
    console.error('Warning: Could not read flows directory:', error.message);
  }
  
  return flows;
}

/**
 * Load all agent configs
 */
function loadAgents() {
  const agentsDir = path.join(__dirname, 'agents');
  const agents = {};
  
  try {
    const files = fs.readdirSync(agentsDir);
    files
      .filter(f => f.endsWith('.json'))
      .forEach(file => {
        try {
          const agent = require(path.join(agentsDir, file));
          agents[agent.agentId] = agent;
        } catch (error) {
          console.error(`Warning: Could not load agent ${file}:`, error.message);
        }
      });
  } catch (error) {
    console.error('Warning: Could not read agents directory:', error.message);
  }
  
  return agents;
}

/**
 * Load state transition config
 */
function loadStateTransitions() {
  return require('./flows/state-transitions.json');
}

/**
 * Validate state transition
 */
function isValidStateTransition(fromState, toState) {
  const config = loadStateTransitions();
  const allowed = config.stateTransitions[fromState]?.allowedNext || [];
  return allowed.includes(toState);
}

/**
 * Get transition requirements
 */
function getTransitionRequirements(fromState, toState) {
  const config = loadStateTransitions();
  const ruleKey = `${fromState}->${toState}`;
  return config.transitionRules[ruleKey] || null;
}

// Exports
module.exports = {
  schemas: loadSchemas(),
  flows: loadFlows(),
  agents: loadAgents(),
  stateTransitions: loadStateTransitions(),
  utils: {
    isValidStateTransition,
    getTransitionRequirements
  },
  version: require('./package.json').version
};
