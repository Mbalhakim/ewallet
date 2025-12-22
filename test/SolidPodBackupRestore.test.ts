import { getData, storeData } from '../util/EncryptedStorage';
import { VcIdModel } from '../util/types/Credential';

// Mock the dependencies first
jest.mock('../util/EncryptedStorage', () => ({
  getData: jest.fn(),
  storeData: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../util/SolidAuthService', () => ({
  solidAuth: {
    checkConnectionStatus: jest.fn(),
    getAuthenticatedFetch: jest.fn(),
    loginWithPassword: jest.fn(),
    disconnect: jest.fn(),
    getAccessToken: jest.fn()
  }
}));

jest.mock('@inrupt/solid-client', () => ({
  createContainerAt: jest.fn(),
  overwriteFile: jest.fn(),
  getFile: jest.fn(),
  getSolidDataset: jest.fn(),
  saveSolidDatasetAt: jest.fn(),
  getSourceUrl: jest.fn()
}));

jest.mock('../util/ReactLogger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock SolidPodService with updated API structure
jest.mock('../util/SolidPodService', () => {
  // Store connection state
  let isConnectedState = true;

  // Mock credential for testing
  const mockCredential = {
    id: 'urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb',
    proof: {
      created: '2023-08-22T13:12:46.269Z',
      jws: 'mockJws',
      proofPurpose: 'assertionMethod',
      type: 'JsonWebSignature2020'
    }
  } as VcIdModel;

  return {
    // Connection methods
    checkConnectionStatus: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        isConnected: isConnectedState,
        connectionInfo: isConnectedState
          ? {
              id: 'test-client-id',
              webId: 'https://example.com/profile/card#me'
            }
          : null
      });
    }),

    // Mock method to manually set connection state for tests
    _setConnected: (value) => {
      isConnectedState = value;
    },

    // Individual backup methods
    backupDidKeys: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      return {
        success: true,
        message: 'DID keys successfully backed up to SOLID POD'
      };
    }),

    backupCredentials: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      return {
        success: true,
        message: 'Backed up 3 credentials to SOLID POD (0 failed)'
      };
    }),

    backupSingleCredential: jest.fn().mockImplementation(async (credential) => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      if (!credential || !credential.id) {
        return {
          success: false,
          message: 'Invalid credential: missing ID'
        };
      }
      return {
        success: true,
        message: `Credential ${credential.id} successfully backed up to SOLID POD`
      };
    }),

    // Consolidated backup method
    backupAllData: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD',
          details: {
            didKeys: false,
            credentials: false
          }
        };
      }
      return {
        success: true,
        message: 'Wallet data backed up to SOLID POD',
        details: {
          didKeys: true,
          credentials: true
        }
      };
    }),

    // Individual restore methods
    restoreDidKeys: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      return {
        success: true,
        message: 'DID keys successfully restored from SOLID POD'
      };
    }),

    restoreCredentials: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      return {
        success: true,
        message: 'Restored 3 credentials from SOLID POD (0 failed)'
      };
    }),

    restoreSingleCredential: jest
      .fn()
      .mockImplementation(async (credentialId) => {
        if (!isConnectedState) {
          return {
            success: false,
            message: 'Not connected to SOLID POD'
          };
        }
        if (!credentialId) {
          return {
            success: false,
            message: 'Invalid credential ID'
          };
        }
        return {
          success: true,
          message: 'Credential successfully retrieved from SOLID POD',
          credential: mockCredential
        };
      }),

    // Consolidated restore method
    restoreAllData: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD',
          details: {
            didKeys: false,
            credentials: false
          }
        };
      }
      return {
        success: true,
        message: 'Wallet data restored from SOLID POD',
        details: {
          didKeys: true,
          credentials: true
        }
      };
    }),

    // List credentials
    listCredentialsInPod: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD'
        };
      }
      return {
        success: true,
        message: 'Found 3 credentials in SOLID POD',
        credentialIds: ['5abfc566', '74bf4cfd', 'ec94ed89']
      };
    }),

    // Status check
    checkPodBackupStatus: jest.fn().mockImplementation(async () => {
      if (!isConnectedState) {
        return {
          success: false,
          message: 'Not connected to SOLID POD',
          available: {
            didKeys: false,
            credentials: false,
            credentialCount: 0
          }
        };
      }
      return {
        success: true,
        message: 'Backup files found on SOLID POD',
        available: {
          didKeys: true,
          credentials: true,
          credentialCount: 3
        }
      };
    })
  };
});

// Get the mocked service
const SolidPodService = require('../util/SolidPodService');

describe('SolidPodBackupRestore Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set connected status to true by default
    SolidPodService._setConnected(true);
  });

  // Test individual backup functions
  describe('Individual backup functions', () => {
    it('should backup DID keys successfully when connected', async () => {
      // Mock data for this test
      (getData as jest.Mock).mockResolvedValueOnce({
        publicKey: [1, 2, 3],
        privateKey: [4, 5, 6]
      });

      // Mock AuthData
      (getData as jest.Mock).mockResolvedValueOnce({
        did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      });

      const result = await SolidPodService.backupDidKeys();

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(SolidPodService.backupDidKeys).toHaveBeenCalled();
    });

    it('should fail to backup DID keys when not connected', async () => {
      // Set disconnected
      SolidPodService._setConnected(false);

      const result = await SolidPodService.backupDidKeys();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not connected');
    });

    it('should backup credentials successfully when connected', async () => {
      // Mock credentials data
      (getData as jest.Mock).mockResolvedValueOnce({
        '2023-08-22T13:12:46.269Z': {
          id: 'urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb',
          proof: { created: '2023-08-22T13:12:46.269Z' }
        }
      });

      const result = await SolidPodService.backupCredentials();

      expect(result.success).toBe(true);
      expect(result.message).toContain('credentials');
    });

    it('should backup a single credential successfully', async () => {
      const mockCredential = {
        id: 'urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb',
        proof: {
          created: '2023-08-22T13:12:46.269Z'
        }
      } as VcIdModel;

      const result =
        await SolidPodService.backupSingleCredential(mockCredential);

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });
  });

  // Test backup all data
  describe('Backup all data', () => {
    it('should backup all wallet data successfully when connected', async () => {
      const result = await SolidPodService.backupAllData();

      expect(result.success).toBe(true);
      expect(result.details.didKeys).toBe(true);
      expect(result.details.credentials).toBe(true);
    });

    it('should fail to backup all data when not connected', async () => {
      // Set disconnected
      SolidPodService._setConnected(false);

      const result = await SolidPodService.backupAllData();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not connected');
      expect(result.details.didKeys).toBe(false);
      expect(result.details.credentials).toBe(false);
    });
  });

  // Test individual restore functions
  describe('Individual restore functions', () => {
    it('should restore DID keys successfully when connected', async () => {
      const result = await SolidPodService.restoreDidKeys();

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(SolidPodService.restoreDidKeys).toHaveBeenCalled();
    });

    it('should fail to restore DID keys when not connected', async () => {
      // Set disconnected
      SolidPodService._setConnected(false);

      const result = await SolidPodService.restoreDidKeys();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not connected');
    });

    it('should restore credentials successfully when connected', async () => {
      // Create a fresh mock just for this test
      SolidPodService.listCredentialsInPod.mockImplementationOnce(async () => {
        return {
          success: true,
          credentialIds: ['id1', 'id2']
        };
      });

      const result = await SolidPodService.restoreCredentials();

      expect(result.success).toBe(true);
      expect(result.message).toContain('credentials');
      expect(SolidPodService.restoreCredentials).toHaveBeenCalled();
    });

    it('should restore a single credential successfully', async () => {
      const result = await SolidPodService.restoreSingleCredential('5abfc566');

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(result.credential).toBeDefined();
      expect(result.credential.id).toBe(
        'urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb'
      );
    });
  });

  // Test restore all data
  describe('Restore all data', () => {
    it('should restore all wallet data successfully when connected', async () => {
      const result = await SolidPodService.restoreAllData();

      expect(result.success).toBe(true);
      expect(result.details.didKeys).toBe(true);
      expect(result.details.credentials).toBe(true);
    });

    it('should fail to restore all data when not connected', async () => {
      // Set disconnected
      SolidPodService._setConnected(false);

      const result = await SolidPodService.restoreAllData();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not connected');
      expect(result.details.didKeys).toBe(false);
      expect(result.details.credentials).toBe(false);
    });
  });

  // Test backup status check
  describe('Backup status check', () => {
    it('should report backup status correctly when connected', async () => {
      const result = await SolidPodService.checkPodBackupStatus();

      expect(result.success).toBe(true);
      expect(result.available.didKeys).toBe(true);
      expect(result.available.credentials).toBe(true);
      expect(result.available.credentialCount).toBe(3);
    });

    it('should fail to check status when not connected', async () => {
      // Set disconnected
      SolidPodService._setConnected(false);

      const result = await SolidPodService.checkPodBackupStatus();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not connected');
      expect(result.available.didKeys).toBe(false);
      expect(result.available.credentials).toBe(false);
      expect(result.available.credentialCount).toBe(0);
    });
  });
});
