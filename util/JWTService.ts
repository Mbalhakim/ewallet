import * as forge from 'node-forge';
import { encode as base64Encode, decode as base64Decode } from 'base-64';
import { getData } from './EncryptedStorage';
import { initializeDidKey } from './DIDGenerator';
import log from './ReactLogger';
import { STORAGE_KEYS } from '../constants/const';
import { TextEncoder } from 'text-encoding';
import { StorageKeyEnums } from '../constants/const';

export async function signJWT(payload: any): Promise<string> {
  try {
    let didKeyPair = await getData(StorageKeyEnums.DID_KEY_PAIR);

    // If no keypair exists, create one
    if (!didKeyPair) {
      log.info(
        '[JWTService] No existing keypair found, initializing new DID...'
      );
      await initializeDidKey();
      didKeyPair = await getData(StorageKeyEnums.DID_KEY_PAIR);

      if (!didKeyPair) {
        throw new Error('Failed to create keypair');
      }
    }

    // Create header with ES256 algorithm
    const header = {
      alg: 'ES256',
      typ: 'JWT'
    };

    // Combine header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Create the string to sign
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Convert stored private key back to usable format
    const privateKeyBytes = new Uint8Array(didKeyPair.privateKey);

    // Convert bytes to string without TextDecoder
    const privateKeyString = Array.from(privateKeyBytes)
      .map((byte) => String.fromCharCode(byte))
      .join('');

    // Extract the actual key data from PEM format
    const pemContents = privateKeyString
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');

    // Decode the base64 PEM content
    const decodedPem = forge.util.decode64(pemContents);

    // Extract private key using direct pattern search
    let privateKey;

    try {
      // Convert the decoded PEM to a byte array
      const bytes = [];
      for (let i = 0; i < decodedPem.length; i++) {
        bytes.push(decodedPem.charCodeAt(i));
      }

      // Search for potential private key data
      for (let i = 0; i < bytes.length - 32; i++) {
        if (bytes[i] === 0x04 && bytes[i + 1] === 0x20) {
          privateKey = new Uint8Array(32);
          for (let j = 0; j < 32; j++) {
            privateKey[j] = bytes[i + 2 + j];
          }
          log.debug('Found potential 32-byte private key at offset', i);
          break;
        }
      }

      // Fallback: Use last 32 bytes as private key
      if (!privateKey) {
        privateKey = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          privateKey[i] = bytes[bytes.length - 32 + i];
        }
        log.debug('Using last 32 bytes as private key');
      }
    } catch (e) {
      log.error('Error extracting private key:', e);
      throw new Error('Failed to extract private key bytes');
    }

    log.debug('Private key byte length:', privateKey.length);

    // Create a digest of the signing input
    const md = forge.md.sha256.create();
    md.update(signingInput);
    const digest = md.digest().getBytes();

    // Convert digest to appropriate format
    const messageBytes = forge.util.createBuffer(digest).getBytes();

    // Sign with Ed25519 and proper encoding parameter
    const signatureBytes = forge.ed25519.sign({
      privateKey: privateKey,
      message: messageBytes,
      encoding: 'binary'
    });

    // Encode the signature in base64url
    const encodedSignature = base64UrlEncodeArray(signatureBytes);

    // Return complete JWT
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  } catch (error) {
    log.error('[JWTService] Error signing JWT:', error);
    throw error;
  }
}

/**
 * Base64Url encoding function for strings
 */
export function base64UrlEncode(input: string): string {
  return base64Encode(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64Url encoding function for Uint8Array
 */
export function base64UrlEncodeArray(data: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < data.length; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  const base64 = base64Encode(binaryString);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode a JWT to see its contents
 */
export const decodeJWT = (jwt: string): any => {
  try {
    if (!jwt) return null;

    const parts = jwt.split('.');
    if (parts.length !== 3) {
      log.debug('Invalid JWT format');
      return null;
    }

    // We only decode the payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
    // Use base64Decode instead of atob
    const rawPayload = base64Decode(paddedBase64);

    return JSON.parse(rawPayload);
  } catch (error) {
    log.debug('Error decoding JWT:', error);
    return null;
  }
};

/**
 * View all parts of a JWT for debugging
 */
export const viewJWT = (
  jwt: string
): { header: any; payload: any; signature: string } => {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  return {
    header: JSON.parse(decodeBase64Url(parts[0])),
    payload: JSON.parse(decodeBase64Url(parts[1])),
    signature: parts[2]
  };
};

/**
 * Helper function to decode base64url encoded parts
 */
function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const pad = base64.length % 4;
  const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
  // Use base64Decode instead of atob
  return base64Decode(paddedBase64);
}

/**
 * Generate a JWT for OpenID4VCI
 * @param client_id The client ID of the application
 * @param c_nonce A nonce value for the request
 * @returns A Promise that resolves to the generated JWT
 */
export async function generateJWT(
  client_id: string,
  c_nonce: string
): Promise<string> {
  try {
    const authData = await getData(StorageKeyEnums.AUTH_DATA);
    const keyPair = await getData(StorageKeyEnums.DID_KEY_PAIR);
    const privateKey = keyPair.privateKey;

    const header = {
      alg: 'EdDSA',
      typ: 'openid4vci-proof+jwt',
      kid: authData.did
    };
    const payload = {
      iss: authData.did,
      aud: client_id,
      iat: Math.floor(Date.now() / 1000),
      nonce: c_nonce
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const msg = new TextEncoder().encode(signingInput);
    const privateKeyString = Array.from(privateKey)
      .map((byte) => String.fromCharCode(byte))
      .join('');
    const extractPemContent = (pem: string): string =>
      pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '');

    const base64ToBytes = (base64: string): Uint8Array =>
      Uint8Array.from(base64Decode(base64), (c) => c.charCodeAt(0));

    const base64Key = extractPemContent(privateKeyString);
    const rawBytes = base64ToBytes(base64Key);

    const signatureBytes = forge.ed25519.sign({
      privateKey: rawBytes,
      message: msg,
      encoding: 'binary'
    });

    const encodedSignature = base64UrlEncodeArray(signatureBytes);

    const jwt = `${signingInput}.${encodedSignature}`;

    return jwt;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw error;
  }
}
