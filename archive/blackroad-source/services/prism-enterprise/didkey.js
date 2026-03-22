const bs58 = require('bs58');

/**
 * Convert a did:key Ed25519 identifier into an SPKI DER public key buffer.
 * @param {string} did did:key identifier, e.g. did:key:z... base58btc encoding.
 * @returns {Buffer} DER-encoded SPKI public key for Node's crypto module.
 * @throws {Error} When the DID is missing, not base58btc, or not Ed25519.
 */
function didkeyToEd25519SPKI(did = '') {
  if (typeof did !== 'string' || !did.trim()) {
    throw new Error('DID is required');
  }

  const trimmed = did.trim();
  const z = trimmed.startsWith('did:key:') ? trimmed.slice(8) : trimmed;
  if (!z.startsWith('z')) {
    throw new Error('DID must use base58btc encoding (prefix: z)');
  }

  const decoded = Buffer.from(bs58.decode(z.slice(1)));
  if (decoded.length !== 34 || decoded[0] !== 0xED || decoded[1] !== 0x01) {
    throw new Error('Invalid Ed25519 did:key format (expected 34 bytes with multicodec prefix 0xED01)');
  }

  const raw = decoded.slice(2); // remove multicodec prefix
  const derPrefix = Buffer.from([0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00]);
  return Buffer.concat([derPrefix, raw]);
}

module.exports = {
  didkeyToEd25519SPKI,
};
