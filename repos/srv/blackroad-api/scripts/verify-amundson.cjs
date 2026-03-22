#!/usr/bin/env node

// Verify Amundson Framework Content Against Manifest
// Usage: node verify-amundson.js <manifest.json> [--equation A0] [--lesson 1] [--content <file>]

const fs = require('fs');
const {
  verifyEquationHash,
  verifyLessonHash,
  verifyMerkleProof,
  LESSON_1_CANONICAL,
  LESSON_2_CANONICAL,
  AMUNDSON_EQUATIONS
} = require('../modules/amundson-patent-framework.cjs');

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node verify-amundson.js <manifest.json> [options]');
    console.log('\nOptions:');
    console.log('  --equation <A0-A7>  Verify specific equation');
    console.log('  --lesson <1|2>      Verify specific lesson');
    console.log('  --content <file>    Use custom content file');
    console.log('  --all               Verify all components');
    console.log('\nExamples:');
    console.log('  node verify-amundson.js manifest.json --equation A6');
    console.log('  node verify-amundson.js manifest.json --lesson 1');
    console.log('  node verify-amundson.js manifest.json --all');
    process.exit(1);
  }

  const manifestPath = args[0];
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  console.log('🔍 Verifying Amundson Framework...\n');
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Version:  ${manifest.metadata.version}`);
  console.log(`Date:     ${manifest.metadata.date}\n`);

  let results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Parse options
  const eqIndex = args.indexOf('--equation');
  const lessonIndex = args.indexOf('--lesson');
  const contentIndex = args.indexOf('--content');
  const verifyAll = args.includes('--all');

  // Verify specific equation
  if (eqIndex >= 0) {
    const eqKey = args[eqIndex + 1];
    const customContent = contentIndex >= 0
      ? fs.readFileSync(args[contentIndex + 1], 'utf8')
      : AMUNDSON_EQUATIONS[eqKey]?.canonical;

    if (!customContent) {
      console.error(`❌ Unknown equation: ${eqKey}`);
      process.exit(1);
    }

    const result = verifyEquationHash(eqKey, customContent, manifest.equations[eqKey].hash);
    results.total++;

    if (result.valid) {
      console.log(`✅ Equation ${eqKey} verified successfully`);
      console.log(`   Hash: ${result.computed.slice(0, 32)}...`);
      results.passed++;
    } else {
      console.log(`❌ Equation ${eqKey} verification FAILED`);
      console.log(`   Expected: ${result.expected.slice(0, 32)}...`);
      console.log(`   Computed: ${result.computed.slice(0, 32)}...`);
      results.failed++;
    }

    // Verify merkle proof
    const merkleResult = verifyMerkleProof(eqKey, manifest);
    results.total++;
    if (merkleResult.valid) {
      console.log(`✅ Merkle proof verified for ${eqKey}`);
      results.passed++;
    } else {
      console.log(`❌ Merkle proof verification FAILED for ${eqKey}`);
      results.failed++;
    }
  }

  // Verify specific lesson
  if (lessonIndex >= 0) {
    const lessonNum = parseInt(args[lessonIndex + 1]);
    const customContent = contentIndex >= 0
      ? fs.readFileSync(args[contentIndex + 1], 'utf8')
      : (lessonNum === 1 ? LESSON_1_CANONICAL : LESSON_2_CANONICAL);

    const lessonKey = `lesson${lessonNum}`;
    const result = verifyLessonHash(lessonNum, customContent, manifest.lessons[lessonKey].hash);
    results.total++;

    if (result.valid) {
      console.log(`✅ Lesson ${lessonNum} verified successfully`);
      console.log(`   Hash: ${result.computed.slice(0, 32)}...`);
      results.passed++;
    } else {
      console.log(`❌ Lesson ${lessonNum} verification FAILED`);
      console.log(`   Expected: ${result.expected.slice(0, 32)}...`);
      console.log(`   Computed: ${result.computed.slice(0, 32)}...`);
      results.failed++;
    }
  }

  // Verify all components
  if (verifyAll) {
    console.log('Running comprehensive verification...\n');

    // Verify all lessons
    for (const lessonNum of [1, 2]) {
      const lessonKey = `lesson${lessonNum}`;
      const content = lessonNum === 1 ? LESSON_1_CANONICAL : LESSON_2_CANONICAL;
      const result = verifyLessonHash(lessonNum, content, manifest.lessons[lessonKey].hash);
      results.total++;

      if (result.valid) {
        console.log(`✅ Lesson ${lessonNum} verified`);
        results.passed++;
      } else {
        console.log(`❌ Lesson ${lessonNum} FAILED`);
        results.failed++;
      }
    }

    // Verify all equations
    for (const eqKey of Object.keys(AMUNDSON_EQUATIONS)) {
      const eq = AMUNDSON_EQUATIONS[eqKey];
      const result = verifyEquationHash(eqKey, eq.canonical, manifest.equations[eqKey].hash);
      results.total++;

      if (result.valid) {
        console.log(`✅ Equation ${eqKey} (${eq.name}) verified`);
        results.passed++;
      } else {
        console.log(`❌ Equation ${eqKey} (${eq.name}) FAILED`);
        results.failed++;
      }

      // Verify merkle proof
      const merkleResult = verifyMerkleProof(eqKey, manifest);
      results.total++;
      if (merkleResult.valid) {
        results.passed++;
      } else {
        console.log(`❌ Merkle proof FAILED for ${eqKey}`);
        results.failed++;
      }
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Total checks: ${results.total}`);
  console.log(`Passed:       ${results.passed} ✅`);
  console.log(`Failed:       ${results.failed} ❌`);
  console.log('═'.repeat(80));

  if (results.failed > 0) {
    console.log('\n⚠️  Some verifications failed. Content may have been modified.');
    process.exit(1);
  } else if (results.passed > 0) {
    console.log('\n✨ All verifications passed! Content is authentic.');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
