import 'react-native-get-random-values';
import { storeData, createAndStoreDID } from './EncryptedStorage';
import { DidKeyPairStorage, DidKeyPair } from './types/Storage';
import * as forge from 'node-forge';
import bs58 from 'bs58';
import log from './ReactLogger';
import { StorageKeyEnums } from '../constants/const';

/**
 * Generates a new EC key pair
 * @returns {forge.pki.KeyPair} The generated EC key pair
 */
export function generateEcKeyPair(): forge.pki.KeyPair {
  log.debug('[DIDGenerator] Generating EC key pair');
  return forge.pki.ed25519.generateKeyPair();
}

/**
 * Converts an EC key pair to PEM format
 * @param {forge.pki.KeyPair} keypair - The EC key pair to convert
 * @returns {Object} Object containing the public and private keys in PEM format
 */
export function convertKeyPairToPem(keypair: any): {
  publicKeyPem: string;
  privateKeyPem: string;
} {
  log.debug('[DIDGenerator] Converting key pair to PEM format');
  // For Ed25519, format as PEM
  const publicKeyPem =
    '-----BEGIN PUBLIC KEY-----\n' +
    base64Encode(keypair.publicKey) +
    '\n-----END PUBLIC KEY-----';

  const privateKeyPem =
    '-----BEGIN PRIVATE KEY-----\n' +
    base64Encode(keypair.privateKey) +
    '\n-----END PRIVATE KEY-----';

  return { publicKeyPem, privateKeyPem };
}

/**
 * Base64 encodes a byte array
 */
export function base64Encode(bytes: Uint8Array): string {
  return forge.util.encode64(forge.util.createBuffer(bytes).getBytes());
}

/**
 * Creates a did:key identifier from an Ed25519 public key
 * @param {Uint8Array} publicKey - The Ed25519 public key
 * @returns {string} The DID identifier in the format did:key:z6Mk...
 */
export function createDidFromPublicKey(publicKey: Uint8Array): string {
  log.debug('[DIDGenerator] Creating DID from public key');

  // Ed25519 multicodec prefix is 0xed01 (hexadecimal)
  const multicodecEd25519Prefix = new Uint8Array([0xed, 0x01]);

  // Combine prefix with public key
  const prefixedKey = new Uint8Array(
    multicodecEd25519Prefix.length + publicKey.length
  );
  prefixedKey.set(multicodecEd25519Prefix);
  prefixedKey.set(publicKey, multicodecEd25519Prefix.length);

  // Base58 encode the prefixed key
  const encodedKey = bs58.encode(prefixedKey);

  // Create the did:key identifier
  const did = `did:key:z${encodedKey}`;
  log.debug('[DIDGenerator] Created DID:', did);
  return did;
}

/**
 * Generates a new DID with corresponding Ed25519 key pair
 * @returns {DidKeyPair} Object containing the DID and key pair
 */
export function generateDidWithKeys(): DidKeyPair {
  log.info('[DIDGenerator] Generating new DID with Ed25519 keys');
  const keypair = generateEcKeyPair();
  const { publicKeyPem, privateKeyPem } = convertKeyPairToPem(keypair);
  const did = createDidFromPublicKey(keypair.publicKey);

  log.info(
    '[DIDGenerator] DID generation complete:',
    did.substring(0, 16) + '...'
  );
  return {
    did,
    publicKey: publicKeyPem,
    privateKey: privateKeyPem
  };
}

/**
 * Initializes a new DID key pair and stores it securely
 * @returns {Promise<string>} The generated did:key identifier
 * @throws {Error} If key generation or storage fails
 */
export async function initializeDidKey(): Promise<string> {
  try {
    log.info('[DIDGenerator] Initializing new DID keypair...');

    const { did, publicKey, privateKey } = generateDidWithKeys();

    function stringToBytes(input: string): number[] {
      return Array.from(input).map((char) => char.charCodeAt(0));
    }

    const keyPairStorage: DidKeyPairStorage = {
      publicKey: stringToBytes(publicKey),
      privateKey: stringToBytes(privateKey)
    };
    log.info('[DIDGenerator] Storing keypair...');

    await storeData(StorageKeyEnums.DID_KEY_PAIR, keyPairStorage);

    await storeData(StorageKeyEnums.AUTH_DATA, {
      did,
      username: '',
      password: '',
      isLoggedIn: false
    });

    log.info('[DIDGenerator] DID Key initialized:', did);
    return did;
  } catch (error) {
    log.error('[DIDGenerator] Error initializing DID key:', error);
    throw error;
  }
}
