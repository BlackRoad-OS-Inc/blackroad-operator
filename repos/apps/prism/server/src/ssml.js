import { escapeSSML, escapeSSMLAttribute } from './utils/beatMath.js';

export function buildSSML(plan) {
  const chunks = plan.sequence.map((segment) => {
    const text = escapeSSML(segment.text);
    const rateAttr = escapeSSMLAttribute(`${segment.ratePercent}%`);
    const pitchAttr = escapeSSMLAttribute(segment.pitchLabel);
    let chunk = `<prosody rate="${rateAttr}" pitch="${pitchAttr}">${text}</prosody>`;
    const breakMs = segment.breakMs;
    if (breakMs) {
      chunk += `<break time="${breakMs}ms"/>`;
    }
    return chunk;
  });
  const voiceAttr = escapeSSMLAttribute(plan.voice);
  return `<speak><voice name="${voiceAttr}">${chunks.join('')}</voice></speak>`;
}
