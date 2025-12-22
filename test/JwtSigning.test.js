// Note: Using .js extension to avoid TypeScript config issues

describe('JWT Signing Tests', () => {
  // Import modules inside the test to avoid TypeScript issues
  const { initializeDidKey } = require('../util/DIDGenerator');
  const { getData } = require('../util/EncryptedStorage');
  const { signJWT } = require('../util/JWTService');

  // Mock EncryptedStorage
  jest.mock('../util/EncryptedStorage', () => {
    let storage = {};

    return {
      getData: jest.fn((key) => Promise.resolve(storage[key] || null)),
      storeData: jest.fn((key, value) => {
        storage[key] = value;
        return Promise.resolve(value);
      })
    };
  });

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully initialize a DID keypair', async () => {
    const did = await initializeDidKey();

    // Verify DID format
    expect(did).toMatch(/^did:key:z/);

    // Check if keypair was stored correctly
    const keyPair = await getData('DidKeyPair');
    console.log('Stored Key Pair:', keyPair); // Debugging log
    expect(keyPair).toBeDefined();
    expect(Array.isArray(keyPair.publicKey)).toBeTruthy();
    expect(Array.isArray(keyPair.privateKey)).toBeTruthy(); // Updated to match the actual key name
    expect(keyPair.publicKey.length).toBeGreaterThan(0);
    expect(keyPair.privateKey.length).toBeGreaterThan(0);
  });

  it('should throw an error if keypair initialization fails', async () => {
    jest.spyOn(require('../util/EncryptedStorage'), 'storeData').mockImplementationOnce(() => {
      throw new Error('Storage failed');
    });

    await expect(initializeDidKey()).rejects.toThrow('Storage failed');
  });

  it('should sign a JWT with the keypair and verify its format', async () => {
    await initializeDidKey();

    const payload = { sub: 'test', name: 'Test User' };
    const jwt = await signJWT(payload);

    // Verify JWT format
    expect(jwt).toBeDefined();
    const parts = jwt.split('.');
    expect(parts.length).toBe(3);

    // Verify header and payload structure
    const [header, encodedPayload] = parts;
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
    const decodedPayload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());

    expect(decodedHeader).toHaveProperty('alg', 'ES256');
    expect(decodedHeader).toHaveProperty('typ', 'JWT');
    expect(decodedPayload).toMatchObject(payload);
  });

  it('should throw an error if signing fails', async () => {
    // Mock getData to return null, simulating a missing keypair
    jest.spyOn(require('../util/EncryptedStorage'), 'getData').mockResolvedValueOnce(null);

    // Mock initializeDidKey to simulate failure in creating a new keypair
    jest.spyOn(require('../util/DIDGenerator'), 'initializeDidKey').mockImplementationOnce(() => {
      throw new Error('Failed to create keypair');
    });

    const payload = { sub: 'test', name: 'Test User' };

    // Expect signJWT to throw an error
    await expect(signJWT(payload)).rejects.toThrow('Failed to create keypair');
  });
});
