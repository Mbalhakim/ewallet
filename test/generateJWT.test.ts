import { generateJWT } from '../util/JWTService';
import { getData } from '../util/EncryptedStorage';
import * as forge from 'node-forge';
import { STORAGE_KEYS } from '../constants/const';

jest.mock('../util/EncryptedStorage');
jest.mock('node-forge');
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

const mockDid = 'did:example:123456789abcdefghi';
const mockClientId = 'client-123';
const mockNonce = 'nonce-xyz';
const fakePemKey = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIBjD0kWv1PkcZBqFt4b0W8m9ErCVAEnrtHoSN5MLwn0g
-----END PRIVATE KEY-----`;

const mockPrivateKey = Array.from(Buffer.from(fakePemKey));

(getData as jest.Mock).mockImplementation((key: string) => {
  switch (key) {
    case STORAGE_KEYS.AUTH_DATA:
      return Promise.resolve({ did: mockDid });
    case STORAGE_KEYS.DID_KEY_PAIR:
      return Promise.resolve({ privateKey: mockPrivateKey });
    default:
      return Promise.resolve(null);
  }
});

export function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlEncodeArray(data: Uint8Array): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
  return Buffer.from(base64 + pad, 'base64').toString();
}

// Mock implementation for ed25519 signing
(forge.ed25519.sign as jest.Mock).mockImplementation(({ message }) => {
  return new Uint8Array(64).fill(2); // mock 64-byte signature
});

describe('generateJWT', () => {
  it('should generate a valid JWT', async () => {
    const jwt = await generateJWT(mockClientId, mockNonce);
    expect(jwt).toBeDefined();
    const parts = jwt.split('.');
    expect(parts.length).toBe(3);

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    expect(header.alg).toBe('EdDSA');
    expect(header.typ).toBe('openid4vci-proof+jwt');
    expect(header.kid).toBe(mockDid);

    expect(payload.iss).toBe(mockDid);
    expect(payload.aud).toBe(mockClientId);
    expect(payload.nonce).toBe(mockNonce);
    expect(typeof payload.iat).toBe('number');
  });
});
