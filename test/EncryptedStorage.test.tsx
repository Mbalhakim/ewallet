import EncryptedStorage from 'react-native-encrypted-storage';
import { StorageKeyEnums } from '../constants/const';

// Mock the necessary imports before importing the module under test
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

// Mock the logger to avoid console output during tests
jest.mock('../util/ReactLogger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock CredentialUuidMapper completely to avoid uuid module issues
jest.mock('../util/CredentialUuidMapper', () => ({
  assignCredentialUuid: jest.fn().mockResolvedValue('test-uuid'),
  getCompactMapping: jest.fn().mockResolvedValue({}),
  saveCompactMapping: jest.fn().mockResolvedValue(undefined)
}));

// Now import the module under test
import { storeData, getData, deleteCredential } from '../util/EncryptedStorage';

describe('EncryptedStorage', () => {
  beforeEach(() => {
    // Reset mock implementation before each test
    jest.clearAllMocks();

    // Default mock implementation for getItem to return empty object
    EncryptedStorage.getItem.mockImplementation(() => Promise.resolve('{}'));
  });

  describe('storeData', () => {
    it('should save auth data correctly', async () => {
      // Arrange
      const authData = {
        did: 'did:example:123',
        username: 'john.doe'
      };

      // Act
      await storeData(StorageKeyEnums.AUTH_DATA, authData);

      // Assert
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        StorageKeyEnums.AUTH_DATA,
        JSON.stringify(authData)
      );
    });

    it('should save DID key pair correctly', async () => {
      // Arrange
      const keyPair = {
        publicKey: 'pubKey123',
        privateKey: 'privKey456'
      };

      // Act
      await storeData(StorageKeyEnums.DID_KEY_PAIR, keyPair);

      // Assert
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        StorageKeyEnums.DID_KEY_PAIR,
        JSON.stringify(keyPair)
      );
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Storage error';
      EncryptedStorage.setItem.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(storeData(StorageKeyEnums.CREDENTIALS, {})).rejects.toThrow(
        `Failed to store data: Error: ${errorMessage}`
      );
    });
  });

  describe('getData', () => {
    it('should retrieve and parse data correctly', async () => {
      // Arrange
      const mockAuthData = { did: 'did:example:123' };
      EncryptedStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockAuthData)
      );

      // Act
      const result = await getData(StorageKeyEnums.AUTH_DATA);

      // Assert
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
        StorageKeyEnums.AUTH_DATA
      );
      expect(result).toEqual(mockAuthData);
    });

    it('should return empty object when no data exists', async () => {
      // Arrange
      EncryptedStorage.getItem.mockResolvedValueOnce(null);

      // Act
      const result = await getData(StorageKeyEnums.CREDENTIALS);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle retrieval errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Retrieval error';
      EncryptedStorage.getItem.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(getData(StorageKeyEnums.AUTH_DATA)).rejects.toThrow(
        `Failed to retrieve data: Error: ${errorMessage}`
      );
    });
  });

  describe('deleteCredential', () => {
    const testKey = '2023-08-22T13:12:46.269Z';
    const mockCredential = { id: 'cred123', type: ['VerifiableCredential'] };

    beforeEach(() => {
      // Set up mock credential data
      const mockCredentials = { [testKey]: mockCredential };
      EncryptedStorage.getItem.mockImplementation((key) => {
        if (key === StorageKeyEnums.CREDENTIALS) {
          return Promise.resolve(JSON.stringify(mockCredentials));
        }
        if (key === StorageKeyEnums.ISSUER_DATA) {
          return Promise.resolve(
            JSON.stringify({
              issuers: {},
              credentials: { [testKey]: mockCredential },
              lastUpdated: new Date().toISOString()
            })
          );
        }
        return Promise.resolve('{}');
      });
    });

    it('should delete a credential from storage', async () => {
      // Act
      await deleteCredential(testKey);

      // Assert
      // Check that setItem was called to update credentials without the deleted one
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
        StorageKeyEnums.CREDENTIALS
      );
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        StorageKeyEnums.CREDENTIALS,
        '{}'
      );

      // Check that setItem was called to update issuerData without the deleted credential
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
        StorageKeyEnums.ISSUER_DATA
      );
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        StorageKeyEnums.ISSUER_DATA,
        expect.stringContaining('"credentials":{}')
      );
    });

    it('should handle non-existent credentials', async () => {
      // Arrange - setup empty credentials
      EncryptedStorage.getItem.mockImplementation((key) => {
        return Promise.resolve('{}');
      });

      // Act
      await deleteCredential('nonExistentKey');

      // Assert - should call getItem but not make any changes
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
        StorageKeyEnums.CREDENTIALS
      );
      // Should not call setItem since nothing changes
      expect(EncryptedStorage.setItem).not.toHaveBeenCalledWith(
        StorageKeyEnums.CREDENTIALS,
        expect.any(String)
      );
    });
  });
});
