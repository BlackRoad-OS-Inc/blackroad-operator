/**
 * Office UI — Name tags, speech bubbles, camera controls
 * Ported from pixel_office nameTagRenderer.ts
 */

/* eslint-disable no-unused-vars */

var OFFICE_UI_BASE_Y = -66;

function drawOfficeNameTag(ctx, agent) {
  const baseX = Math.round(agent.x);
  const footY = Math.round(agent.y);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const statusColor = STATE_COLORS[agent.agentState] || STATE_COLORS[agent.metadata.status] || '#94a3b8';

  // Role label
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';
  let roleStr = agent.role || agent.metadata.name || 'Agent';
  if (roleStr.length > 20) roleStr = roleStr.slice(0, 19) + '...';

  const tw = ctx.measureText(roleStr).width;
  const roleBoxW = tw + 16;
  const roleBoxH = 16;
  const roleBoxX = baseX - roleBoxW / 2;
  const roleBoxY = footY + OFFICE_UI_BASE_Y - roleBoxH;

  // Role background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(roleBoxX, roleBoxY, roleBoxW, roleBoxH, 4);
  ctx.fill();
  ctx.stroke();

  // Role text
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(roleStr, baseX, footY + OFFICE_UI_BASE_Y - 3);

  // Status badge
  const state = agent.agentState || 'idle';
  const displayState = state === 'done' ? 'DONE' : state === 'idle' ? 'RESTING' : state.toUpperCase();

  ctx.font = 'bold 9.5px sans-serif';
  const stateTw = ctx.measureText(displayState).width;

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = statusColor;
  const paddingX = 10;
  const sBoxW = stateTw + paddingX * 2;
  const sBoxH = 15;
  const sBoxX = baseX - sBoxW / 2;
  const sBoxY = roleBoxY - sBoxH - 5;

  ctx.beginPath();
  ctx.roundRect(sBoxX, sBoxY, sBoxW, sBoxH, sBoxH / 2);
  ctx.fill();

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayState, baseX, sBoxY + sBoxH - 3);

  ctx.restore();
}

function drawOfficeBubble(ctx, agent) {
  const now = Date.now();
  const baseX = Math.round(agent.x);
  const bubbleY = Math.round(agent.y) + OFFICE_UI_BASE_Y - 45;

  ctx.save();

  if (agent.bubble && agent.bubble.expiresAt > now) {
    const icon = agent.bubble.icon ? agent.bubble.icon + ' ' : '';
    const text = icon + agent.bubble.text;

    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
    const tw = ctx.measureText(text).width;
    const paddingH = 10;
    const paddingV = 8;
    const boxW = tw + paddingH * 2;
    const boxH = 16 + paddingV * 2;
    const boxX = baseX - boxW / 2;
    const boxY = bubbleY - boxH;

    // Bubble background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.stroke();

    // Tail (6px half-width, 7px height — consistent with styles.css)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(baseX - 6, boxY + boxH);
    ctx.lineTo(baseX + 6, boxY + boxH);
    ctx.lineTo(baseX, boxY + boxH + 7);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.stroke();

    // Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, baseX, boxY + boxH / 2);
  }

  ctx.restore();
}
