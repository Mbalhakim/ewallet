import * as DIDGenerator from '../util/DIDGenerator';
import * as EncryptedStorage from '../util/EncryptedStorage';
import bs58 from 'bs58';
import * as forge from 'node-forge';

jest.mock('../util/EncryptedStorage');
jest.mock('../util/ReactLogger');
jest.mock('bs58');
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

const mockKeyPair = {
  publicKey: new Uint8Array([1, 2, 3]),
  privateKey: new Uint8Array([4, 5, 6])
};

const base64EncodedPublicKey = 'AQID';
const base64EncodedPrivateKey = 'BAUG';

// Mock forge behavior
jest.spyOn(forge.pki.ed25519, 'generateKeyPair').mockReturnValue(mockKeyPair);
jest.spyOn(forge.util, 'createBuffer').mockImplementation((bytes) => {
  return {
    getBytes: () => String.fromCharCode(...bytes)
  };
});
jest.spyOn(forge.util, 'encode64').mockImplementation((bytes) => {
  return btoa(bytes);
});

describe('DIDGenerator', () => {
  test('generateEcKeyPair returns valid keypair', () => {
    const keypair = DIDGenerator.generateEcKeyPair();
    expect(keypair).toEqual(mockKeyPair);
  });

  test('convertKeyPairToPem formats keys correctly', () => {
    const { publicKeyPem, privateKeyPem } =
      DIDGenerator.convertKeyPairToPem(mockKeyPair);
    expect(publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----');
    expect(publicKeyPem).toContain(base64EncodedPublicKey);
    expect(privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----');
    expect(privateKeyPem).toContain(base64EncodedPrivateKey);
  });

  test('base64Encode returns base64 string', () => {
    const result = DIDGenerator.base64Encode(mockKeyPair.publicKey);
    expect(result).toBe(base64EncodedPublicKey);
  });

  test('createDidFromPublicKey creates valid did:key identifier', () => {
    (bs58.encode as jest.Mock).mockReturnValue('abc123');
    const did = (DIDGenerator as any).createDidFromPublicKey(
      new Uint8Array([10, 20, 30])
    );
    expect(did).toBe('did:key:zabc123');
  });

  test('generateDidWithKeys returns structured did and keys', () => {
    const result = DIDGenerator.generateDidWithKeys();
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('privateKey');
  });

  test('initializeDidKey stores keypair and returns DID', async () => {
    (EncryptedStorage.storeData as jest.Mock).mockResolvedValue(undefined);

    const did = await DIDGenerator.initializeDidKey();
    expect(typeof did).toBe('string');
    expect(EncryptedStorage.storeData).toHaveBeenCalledWith(
      'DidKeyPair',
      expect.any(Object)
    );
    expect(EncryptedStorage.storeData).toHaveBeenCalledWith(
      'AuthData',
      expect.objectContaining({
        did,
        isLoggedIn: false
      })
    );
  });

  test('initializeDidKey throws error on failure', async () => {
    (EncryptedStorage.storeData as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Storage failed');
    });
    await expect(DIDGenerator.initializeDidKey()).rejects.toThrow(
      'Storage failed'
    );
  });
});
