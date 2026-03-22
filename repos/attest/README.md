# Attestation Bundles

This module generates immutable evidence bundles for policy evaluations. Each
bundle contains a canonical `manifest.json`, a PDF cover sheet, and detached
signatures.

## Generating bundles

Use `generateAttestationBundle` to produce a signed archive:

```ts
import { generateAttestationBundle } from '../attest/attest.js';

const { bundlePath, manifest } = await generateAttestationBundle({
  inputs: myInputs,
  prompt: promptText,
  model: 'gpt-4o',
  policy: { name: 'Prism Default', version: '2024.09' },
  decisions: evaluationResult
});
```

The manifest records hashes for the inputs and prompt, the policy metadata, and
signatures. Ed25519 signing derives a key pair from `ATTEST_SEED` (32-byte hex)
which makes deterministic test runs possible.

### PQC toggle

If `OQS_CLI` is set, the generator attempts to sign a canonical tarball using
`oqs-sig sig default`. The resulting base64 signature is added to the manifest
under `signatures.pqc`. When the CLI is missing the manifest records
`{"mode":"unavailable"}` instead. Callers can explicitly disable PQC by
passing `metadata.disablePqc = true`, which records `{"mode":"disabled"}`.

The PQC signature covers the canonical manifest (without the `signatures`
section) and report. This avoids recursion when embedding the signature in the
manifest. Verifiers reproduce the same canonical payload before invoking
`oqs-sig`.

## Verifying bundles

`verifyAttestationBundle` extracts the archive, recomputes the SHA-256 bundle
hash, and checks the embedded Ed25519 signature. A successful verification
returns `{ valid: true, hash, manifest }`.

## Rotating keys

1. Generate a fresh 32-byte random seed.
2. Store it securely as `ATTEST_SEED` (Hex encoded).
3. Restart the API to make the new key active.
4. Keep previous bundles – the manifest keeps the signing public key, so old
   evidence remains verifiable.

## Testing

Run the focused attestation tests:

```bash
npm --prefix apps/api test -- attest
```

## Files

- `manifest.schema.json` – schema for the canonical manifest structure.
- `pdf/report.ts` – PDF rendering utilities.
- `attest.ts` – bundle generation and verification entry points.
- `VERSION` – semantic version of the bundle format.
