import { Keys } from 'casper-js-sdk';

/**
 * Generate a random fake asymmetric key for E2E tests
 * @param fakeKey
 * @returns {AsymmetricKey}
 */
export default function generateAsymmetricKey(fakeKey) {
  const privateKey = Keys.Ed25519.parsePrivateKey(
    Keys.Ed25519.readBase64WithPEM(fakeKey),
  );
  const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
  return Keys.Ed25519.parseKeyPair(publicKey, privateKey);
}
