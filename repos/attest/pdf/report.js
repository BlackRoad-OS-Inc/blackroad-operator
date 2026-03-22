import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (err) {
  const fallbackBase = createRequire(new URL('../../apps/api/package.json', import.meta.url));
  PDFDocument = fallbackBase('pdfkit');
}

const HEADER_COLOR = '#0d1b2a';
const LABEL_COLOR = '#415a77';

function textBlock(doc, label, value, options = {}) {
  const gap = options.gap ?? 6;
  doc.fillColor(LABEL_COLOR).fontSize(9).text(label.toUpperCase());
  doc.fillColor('black').fontSize(12).text(value, { paragraphGap: gap });
}

export async function renderReport(summary) {
  const doc = new PDFDocument({ size: 'A4', margin: 54 });
  const chunks = [];
  return await new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fillColor(HEADER_COLOR).fontSize(20).text('BlackRoad Evidence Bundle', { align: 'left' });
    doc.moveDown(0.5);
    doc.fillColor('black').fontSize(12).text('Immutable evaluation record for Prism Console policy checks.');
    doc.moveDown();

    textBlock(doc, 'Bundle ID', summary.bundleId);
    textBlock(doc, 'Bundle Hash (SHA-256)', summary.bundleHash);
    textBlock(doc, 'Policy', `${summary.policyName} — v${summary.policyVersion}`);
    textBlock(doc, 'Evaluation Timestamp', summary.evaluatedAt);
    textBlock(doc, 'Signature Timestamp', summary.signedAt);
    textBlock(doc, 'Prompt Hash', summary.promptHash);
    textBlock(doc, 'Input Hash', summary.inputHash);

    doc.moveDown(0.5);
    doc.fillColor(LABEL_COLOR).fontSize(9).text('SIGNATURES');
    doc.fillColor('black').fontSize(12).text(`Ed25519 ✔  pk:${summary.ed25519?.publicKey ?? 'n/a'}`);
    const pqc = summary.pqc;
    if (pqc && pqc.mode === 'signed') {
      doc.text(`PQC ✔  algorithm:${pqc.algorithm}`);
    } else if (pqc && pqc.mode) {
      doc.text(`PQC ${pqc.mode}`);
    } else {
      doc.text('PQC unavailable');
    }

    doc.moveDown(1);
    doc.fillColor(LABEL_COLOR).fontSize(9).text('AUTOMATED CHECKSUM');
    const checksum = createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
    doc.fillColor('black').fontSize(10).text(checksum);

    doc.end();
  });
}
