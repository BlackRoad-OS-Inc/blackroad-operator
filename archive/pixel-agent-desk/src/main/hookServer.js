/**
 * HTTP Hook Server
 * HTTP hook server that receives POST requests directly from Claude CLI (with schema validation)
 */

const http = require('http');
const Ajv = require('ajv');

const MAX_BODY_SIZE = 1024 * 1024; // 1MB

function startHookServer({ processHookEvent, debugLog, HOOK_SERVER_PORT, errorHandler }) {
  // JSON Schema for hook validation
  const hookSchema = {
    type: 'object',
    required: ['hook_event_name'],
    properties: {
      hook_event_name: {
        type: 'string',
        enum: [
          'SessionStart', 'SessionEnd', 'UserPromptSubmit',
          'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
          'Stop', 'TaskCompleted', 'PermissionRequest', 'Notification',
          'SubagentStart', 'SubagentStop', 'TeammateIdle',
          'ConfigChange', 'WorktreeCreate', 'WorktreeRemove', 'PreCompact',
          'InstructionsLoaded'  // new event
        ]
      },
      session_id: { type: 'string' },
      transcript_path: { type: 'string' },
      cwd: { type: 'string' },
      permission_mode: { type: 'string' },
      tool_name: { type: 'string' },
      tool_input: { type: 'object' },
      tool_response: { type: 'object' },
      source: { type: 'string' },
      model: { type: 'string' },
      agent_type: { type: 'string' },
      agent_id: { type: 'string' },
      notification_type: { type: 'string' },
      last_assistant_message: { type: 'string' },
      reason: { type: 'string' },
      teammate_name: { type: 'string' },
      team_name: { type: 'string' },
      task_id: { type: 'string' },
      task_subject: { type: 'string' },
      trigger: { type: 'string' },
      agent_transcript_path: { type: 'string' },
      _pid: { type: 'number' },
      _timestamp: { type: 'number' }
    },
    additionalProperties: true  // Keep this since Claude may add new fields
  };

  const ajv = new Ajv();
  const validateHook = ajv.compile(hookSchema);

  const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/hook') {
      res.writeHead(404); res.end(); return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        res.writeHead(413); res.end(); req.destroy(); return;
      }
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));

      try {
        const data = JSON.parse(body);
        debugLog(`[Hook] ← ${data.hook_event_name || '?'} session=${(data.session_id || '').slice(0, 8) || '?'} _pid=${data._pid} _timestamp=${data._timestamp}`);

        // Validate JSON schema
        const isValid = validateHook(data);
        if (!isValid) {
          debugLog(`[Hook] Validation FAILED for ${data.hook_event_name}: ${JSON.stringify(validateHook.errors)}`);
          return;
        }

        processHookEvent(data);
      } catch (e) {
        errorHandler.capture(e, {
          code: 'E010',
          category: 'PARSE',
          severity: 'WARNING'
        });
        debugLog(`[Hook] Parse error: ${e.message}`);
      }
    });
  });

  server.on('error', (e) => debugLog(`[Hook] Server error: ${e.message}`));
  server.listen(HOOK_SERVER_PORT, '127.0.0.1', () => {
    debugLog(`[Hook] HTTP hook server listening on port ${HOOK_SERVER_PORT}`);
  });

  return server;
}

module.exports = { startHookServer };
