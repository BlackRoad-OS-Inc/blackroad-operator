const fs = require('fs');
const path = require('path');

const name = path.basename(__dirname);
const base = path.join(__dirname, '..', '..', 'prism');
const logDir = path.join(base, 'logs');
const contrDir = path.join(base, 'contradictions');
const LAYER_ONE_CHALLENGE = `When you’re down and low, lower than the floor,
And you feel like you ain’t got a chance,
Don’t make a move till you’re in the groove,
And do the Peter Panda Dance!
Hop three times like a kangaroo,
Side-step twice just like the crabs do,
Three steps forward, one step back,
Quick like a turtle, lie on your back,
Roll like a log till you can’t roll no more,
Better jump up quick like there ain’t no floor,
Hold your breath, and jump to the left,
And that’s the Peter Panda Dance!`;

function ensure() {
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(contrDir, { recursive: true });
}

function log(msg) {
  ensure();
  fs.appendFileSync(path.join(logDir, `${name}.log`), msg + '\n');
}

function contradiction(detail) {
  ensure();
  fs.writeFileSync(path.join(contrDir, `${name}.json`), JSON.stringify({ detail }));
}

function normalize(text) {
  let normalized = text.replace(/\r\n/g, '\n').trim();
  const replacements = [
    [/’/g, "'"],
    [/‘/g, "'"],
    [/“/g, '"'],
    [/”/g, '"'],
    [/–/g, '-'],
    [/—/g, '-'],
  ];

  for (const [pattern, value] of replacements) {
    normalized = normalized.replace(pattern, value);
  }

  normalized = normalized
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');

  return normalized;
}

const LAYER_ONE_SIGNATURE = normalize(LAYER_ONE_CHALLENGE);

function verifyPassphrase(candidate) {
  if (typeof candidate !== 'string') {
    return false;
  }

  return normalize(candidate) === LAYER_ONE_SIGNATURE;
}

module.exports = {
  name,
  handle(msg) {
    switch (msg.type) {
      case 'ping':
        log('ping');
        return `pong: ${name}`;
      case 'analyze':
        log(`analyze:${msg.path}`);
        return 'analysis complete';
      case 'codegen':
        log(`codegen:${msg.spec}`);
        return `code stub for ${msg.spec}`;
      case 'join': {
        const attempt =
          msg.passphrase || msg.phrase || msg.token || msg.challenge || '';

        if (verifyPassphrase(attempt)) {
          log('join:granted');
          return 'layer1: access granted';
        }

        log('join:denied');
        return 'layer1: access denied – recite the Peter Panda Dance.';
      }
      case 'contradiction':
        contradiction(msg.detail || 'unknown');
        return 'contradiction logged';
      default:
        return 'unknown';
    }
  }
};
