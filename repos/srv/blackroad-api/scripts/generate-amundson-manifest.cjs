#!/usr/bin/env node

// Generate Amundson Patent Framework Manifest
// Usage: node generate-amundson-manifest.cjs [--output <path>]

const fs = require('fs');
const path = require('path');
const {
  generateAmundsonHashManifest,
  generateCertificateOfOrigin
} = require('../modules/amundson-patent-framework.cjs');

function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output');
  const outputDir = outputIndex >= 0 && args[outputIndex + 1]
    ? path.resolve(args[outputIndex + 1])
    : '/srv/patent-archive/amundson';

  // Validate the path doesn't escape expected boundaries
  if (!outputDir.startsWith('/srv/patent-archive/')) {
    console.error('Output directory must be within /srv/patent-archive/');
    process.exit(1);
  }
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🔒 Generating Amundson Patent Framework Manifest...\n');

  // Generate manifest
  const manifest = generateAmundsonHashManifest();

  // Save manifest as JSON
  const manifestPath = path.join(outputDir, 'amundson-framework-v1.0-manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  console.log(`✅ Manifest saved: ${manifestPath}`);

  // Generate and save certificate
  const certificate = generateCertificateOfOrigin(manifest);
  const certPath = path.join(outputDir, 'amundson-framework-v1.0-certificate.txt');
  fs.writeFileSync(certPath, certificate, 'utf8');
  console.log(`✅ Certificate saved: ${certPath}`);

  // Save canonical content
  const lesson1Path = path.join(outputDir, 'lesson-1-canonical.md');
  fs.writeFileSync(lesson1Path, require('../modules/amundson-patent-framework.cjs').LESSON_1_CANONICAL, 'utf8');
  console.log(`✅ Lesson 1 canonical saved: ${lesson1Path}`);

  const lesson2Path = path.join(outputDir, 'lesson-2-canonical.md');
  fs.writeFileSync(lesson2Path, require('../modules/amundson-patent-framework.cjs').LESSON_2_CANONICAL, 'utf8');
  console.log(`✅ Lesson 2 canonical saved: ${lesson2Path}`);

  // Generate summary report
  console.log('\n' + '═'.repeat(80));
  console.log('📊 MANIFEST SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Creator:      ${manifest.metadata.creator}`);
  console.log(`Organization: ${manifest.metadata.organization}`);
  console.log(`Date:         ${manifest.metadata.date}`);
  console.log(`Version:      ${manifest.metadata.version}`);
  console.log(`Algorithm:    ${manifest.metadata.algorithm}`);
  console.log('\nLesson Hashes:');
  console.log(`  Lesson 1: ${manifest.lessons.lesson1.shortHash}...`);
  console.log(`  Lesson 2: ${manifest.lessons.lesson2.shortHash}...`);
  console.log('\nAmundson Equations:');
  for (const [key, eq] of Object.entries(manifest.equations)) {
    console.log(`  ${key}: ${eq.shortHash}... (${eq.metadata.name})`);
  }
  console.log(`\nComposite Hash: ${manifest.composite.fullFramework.shortHash}...`);
  console.log(`Merkle Root:    ${manifest.merkleTree.hash.slice(0, 16)}...`);
  console.log('═'.repeat(80));

  console.log('\n✨ Patent framework ready for blockchain anchoring!');
  console.log('\nNext steps:');
  console.log('  1. Review certificate: cat ' + certPath);
  console.log('  2. Anchor to blockchain: curl -X POST http://localhost:3000/api/patent/amundson/anchor');
  console.log('  3. Verify via API: curl http://localhost:3000/api/patent/amundson/verify\n');

  return manifest;
}

if (require.main === module) {
  main();
}

module.exports = { main };
