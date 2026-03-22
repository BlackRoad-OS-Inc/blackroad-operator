// Amundson Patent Framework - API Endpoints for Public Verification
// Integrates with existing PatentNet infrastructure

const fs = require('fs');
const path = require('path');
const {
  generateAmundsonHashManifest,
  verifyEquationHash,
  verifyLessonHash,
  verifyMerkleProof,
  generateCertificateOfOrigin,
  AMUNDSON_EQUATIONS,
  LESSON_1_CANONICAL,
  LESSON_2_CANONICAL
} = require('./amundson-patent-framework.cjs');

const MANIFEST_PATH = '/srv/patent-archive/amundson/amundson-framework-v1.0-manifest.json';

module.exports = function attachAmundsonPatentAPI({ app }) {
  if (!app || typeof app.get !== 'function' || typeof app.post !== 'function') {
    throw new Error('Invalid Express app instance provided to attachAmundsonPatentAPI');
  }
  const OK = (res, data) => res.type('application/json').send(JSON.stringify({ ok: true, data, error: null }));
  const FAIL = (res, msg, code = 400) => res.status(code).type('application/json').send(JSON.stringify({ ok: false, data: null, error: String(msg) }));

  // Manifest cache and last modified time
  let manifestCache = null;
  let manifestLastModified = null;

  // Middleware to load manifest with caching and invalidation
  function loadManifest() {
    if (!fs.existsSync(MANIFEST_PATH)) {
      manifestCache = null;
      manifestLastModified = null;
      return null;
    }
    try {
      const stats = fs.statSync(MANIFEST_PATH);
      if (manifestCache && manifestLastModified >= stats.mtimeMs) {
        return manifestCache;
      }
      manifestCache = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      manifestLastModified = stats.mtimeMs;
      return manifestCache;
    } catch (e) {
      console.error('[amundson-api] Error loading manifest:', e.message, 'at', MANIFEST_PATH);
      manifestCache = null;
      manifestLastModified = null;
      return null;
    }
  }

  // GET /api/patent/amundson/manifest - Get current manifest
  app.get('/api/patent/amundson/manifest', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found. Generate it first using POST /api/patent/amundson/generate', 404);
    }
    OK(res, manifest);
  });

  // POST /api/patent/amundson/generate - Generate fresh manifest
  app.post('/api/patent/amundson/generate', (req, res) => {
    try {
      const manifest = generateAmundsonHashManifest();

      // Ensure directory exists
      const dir = path.dirname(MANIFEST_PATH);
      fs.mkdirSync(dir, { recursive: true });

      // Save manifest
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

      // Save certificate
      const cert = generateCertificateOfOrigin(manifest);
      const certPath = path.join(dir, 'amundson-framework-v1.0-certificate.txt');
      fs.writeFileSync(certPath, cert, 'utf8');

      // Save canonical lessons
      fs.writeFileSync(path.join(dir, 'lesson-1-canonical.md'), LESSON_1_CANONICAL, 'utf8');
      fs.writeFileSync(path.join(dir, 'lesson-2-canonical.md'), LESSON_2_CANONICAL, 'utf8');

      OK(res, {
        manifest: manifest,
        paths: {
          manifest: MANIFEST_PATH,
          certificate: certPath,
          lesson1: path.join(dir, 'lesson-1-canonical.md'),
          lesson2: path.join(dir, 'lesson-2-canonical.md')
        }
      });
    } catch (e) {
      FAIL(res, e.message || String(e), 500);
    }
  });

  // GET /api/patent/amundson/certificate - Get human-readable certificate
  app.get('/api/patent/amundson/certificate', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found', 404);
    }
    const cert = generateCertificateOfOrigin(manifest);
    res.type('text/plain').send(cert);
  });

  // POST /api/patent/amundson/verify/equation - Verify equation content
  // Body: { equation: "A0", content: "..." }
  app.post('/api/patent/amundson/verify/equation', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found', 404);
    }

    const { equation, content } = req.body || {};
    if (!equation || !content) {
      return FAIL(res, 'equation and content required', 422);
    }

    if (!AMUNDSON_EQUATIONS[equation]) {
      return FAIL(res, `Unknown equation: ${equation}`, 400);
    }

    const result = verifyEquationHash(equation, content, manifest.equations[equation].hash);
    const merkleResult = verifyMerkleProof(equation, manifest);

    OK(res, {
      equation: equation,
      hashVerified: result.valid,
      merkleVerified: merkleResult.valid,
      computedHash: result.computed,
      expectedHash: result.expected,
      metadata: manifest.equations[equation].metadata
    });
  });

  // POST /api/patent/amundson/verify/lesson - Verify lesson content
  // Body: { lesson: 1, content: "..." }
  app.post('/api/patent/amundson/verify/lesson', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found', 404);
    }

    const { lesson, content } = req.body || {};
    if (!lesson || !content) {
      return FAIL(res, 'lesson and content required', 422);
    }

    const lessonNum = parseInt(lesson);
    if (![1, 2].includes(lessonNum)) {
      return FAIL(res, 'lesson must be 1 or 2', 400);
    }

    const lessonKey = `lesson${lessonNum}`;
    const result = verifyLessonHash(lessonNum, content, manifest.lessons[lessonKey].hash);

    OK(res, {
      lesson: lessonNum,
      verified: result.valid,
      computedHash: result.computed,
      expectedHash: result.expected,
      metadata: manifest.lessons[lessonKey].metadata
    });
  });

  // GET /api/patent/amundson/equations - List all equations with metadata
  app.get('/api/patent/amundson/equations', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found', 404);
    }

    const equations = Object.entries(AMUNDSON_EQUATIONS).map(([key, eq]) => ({
      id: key,
      name: eq.name,
      description: eq.description,
      dependencies: eq.dependencies,
      canonical: eq.canonical,
      hash: manifest.equations[key].shortHash + '...',
      fullHash: manifest.equations[key].hash
    }));

    OK(res, { equations, merkleRoot: manifest.merkleTree.hash });
  });

  // POST /api/patent/amundson/anchor - Anchor to blockchain via PatentNet
  app.post('/api/patent/amundson/anchor', async (req, res) => {
    try {
      const manifest = loadManifest();
      if (!manifest) {
        return FAIL(res, 'Manifest not found. Generate it first.', 404);
      }

      // Prepare patent claim for PatentNet
      const claim = {
        title: manifest.metadata.title,
        abstract: `Mathematical framework for augmented intelligence featuring the Amundson equation set (A0-A7) for quantum learning management systems. Novel contributions include human-aligned regularization (A6) and quantum-style alignment verification (A7).`,
        claimsText: `
CLAIM 1: A method for augmented intelligence comprising:
  - The Amundson equation set (A0-A7) for impedance-based learning models
  - Human-aligned regularization framework (A6) preventing ERM overfitting
  - Quantum-style amplitude alignment verification (A7)
  - Smith Chart interpretation for multi-agent learning stability (QLMS)

CLAIM 2: The specific mathematical formulations A0-A7 as defined in the canonical set:
  - A0: Normalization of learning impedance
  - A1: Augmented absorption metric
  - A2: Coherence Standing-Wave Ratio (CSWR)
  - A3: Series nudge (Z-plane inline adjustment)
  - A4: Shunt nudge (Y-plane sidecar adjustment)
  - A5: Stability contours for convergence
  - A6: Augmented risk with human-aligned regularization
  - A7: Amplitude alignment for intent verification

CLAIM 3: The pedagogical framework comprising Lesson 1 (Magic Chart Foundations) and Lesson 2 (Augmented Intelligence & Magic Chart) as canonical teaching materials.
        `,
        tags: ['amundson-equations', 'augmented-intelligence', 'qlms', 'smith-chart', 'patent', 'mathematical-framework'],
        author: manifest.metadata.creator,
        claimType: 'defensive-publication',
        attachments: [
          {
            name: 'manifest.json',
            b64: Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64')
          },
          {
            name: 'certificate.txt',
            b64: Buffer.from(generateCertificateOfOrigin(manifest)).toString('base64')
          }
        ]
      };

      // Call PatentNet API to register claim
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:3000/api/patent/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim)
      });

      const result = await response.json();

      if (result.ok) {
        // Update manifest with chain info
        manifest.verification.chainAnchor = {
          hash: result.data.hash,
          txHash: result.data.txHash,
          tokenId: result.data.tokenId,
          uri: result.data.uri,
          day: result.data.day,
          timestamp: new Date().toISOString()
        };

        // Save updated manifest
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

        OK(res, {
          anchored: true,
          blockchain: result.data,
          manifest: manifest
        });
      } else {
        FAIL(res, result.error || 'Failed to anchor to blockchain', 500);
      }
    } catch (e) {
      FAIL(res, e.message || e, 500);
    }
  });

  // GET /api/patent/amundson/verify - Public verification endpoint
  // Query params: ?equation=A6 or ?lesson=1
  app.get('/api/patent/amundson/verify', (req, res) => {
    const manifest = loadManifest();
    if (!manifest) {
      return FAIL(res, 'Manifest not found', 404);
    }

    const { equation, lesson } = req.query;

    if (equation) {
      if (!AMUNDSON_EQUATIONS[equation]) {
        return FAIL(res, `Unknown equation: ${equation}`, 400);
      }

      const eq = AMUNDSON_EQUATIONS[equation];
      const result = verifyEquationHash(equation, eq.canonical, manifest.equations[equation].hash);
      const merkleResult = verifyMerkleProof(equation, manifest);

      OK(res, {
        type: 'equation',
        id: equation,
        name: eq.name,
        verified: result.valid && merkleResult.valid,
        hash: manifest.equations[equation].hash,
        metadata: manifest.equations[equation].metadata,
        chainAnchor: manifest.verification.chainAnchor
      });
    } else if (lesson) {
      const lessonNum = parseInt(lesson);
      if (![1, 2].includes(lessonNum)) {
        return FAIL(res, 'lesson must be 1 or 2', 400);
      }

      const content = lessonNum === 1 ? LESSON_1_CANONICAL : LESSON_2_CANONICAL;
      const lessonKey = `lesson${lessonNum}`;
      const result = verifyLessonHash(lessonNum, content, manifest.lessons[lessonKey].hash);

      OK(res, {
        type: 'lesson',
        id: lessonNum,
        verified: result.valid,
        hash: manifest.lessons[lessonKey].hash,
        metadata: manifest.lessons[lessonKey].metadata,
        chainAnchor: manifest.verification.chainAnchor
      });
    } else {
      // Return overall framework status
      OK(res, {
        framework: 'Amundson Equation Set v1.0',
        creator: manifest.metadata.creator,
        organization: manifest.metadata.organization,
        date: manifest.metadata.date,
        compositeHash: manifest.composite.fullFramework.hash,
        merkleRoot: manifest.merkleTree.hash,
        chainAnchor: manifest.verification.chainAnchor,
        equations: Object.keys(AMUNDSON_EQUATIONS),
        lessons: [1, 2],
        publicEndpoint: 'https://blackroad.io/api/patent/amundson/verify'
      });
    }
  });

  console.log('[amundson-patent-api] Endpoints ready: /api/patent/amundson/*');
};
