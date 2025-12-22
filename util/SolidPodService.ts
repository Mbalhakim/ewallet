import { getData, storeData } from './EncryptedStorage';
import log from './ReactLogger';
import {
  createContainerAt,
  overwriteFile,
  getSolidDataset,
  getContainedResourceUrlAll
} from '@inrupt/solid-client';
import { solidAuth } from './SolidAuthService';
import {
  WALLET_CONTAINER_PATH,
  DID_KEYS_FILE,
  SOLID_JSON_BACKUP,
  StorageKeyEnums
} from '../constants/const';
import { VcIdModel } from './types/Credential';
import {
  assignCredentialUuid,
  getCompactMapping,
  saveCompactMapping
} from './CredentialUuidMapper';

export interface ConnectionInfo {
  id?: string;
  webId?: string;
}

// Directory paths

/**
 * Creates container aka directory on the pod strage if it doesn't exist
 */
async function ensureContainerExist(
  containerUri: string,
  authenticatedFetch: any
): Promise<void> {
  try {
    await createContainerAt(containerUri, {
      fetch: authenticatedFetch as unknown as typeof fetch
    });
  } catch (error) {
    // Ignore 409 Conflict (container already exists)
    if (!error.toString().includes('409')) {
      log.warn('Container creation error:', error);
      throw error;
    }
  }
}

/**
 * Throws if not connected to Solid Pod.
 */
async function requireSolidPodConnection(): Promise<{
  connectionInfo: ConnectionInfo;
}> {
  const { isConnected, connectionInfo } =
    await solidAuth.checkConnectionStatus();
  if (!isConnected || !connectionInfo) {
    throw new Error('Not connected to SOLID POD');
  }
  return { connectionInfo };
}

/**
 * Returns the DID key pair and auth data from local storage.
 * Throws if missing.
 */
async function getDidKeyBackupData() {
  const keyPair = await getData(StorageKeyEnums.DID_KEY_PAIR);
  const authData = await getData(StorageKeyEnums.AUTH_DATA);
  if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
    throw new Error('No DID key pair found in local storage');
  }
  if (!authData || !authData.did) {
    throw new Error('No DID identifier found in local storage');
  }
  return { keyPair, did: authData.did };
}

/**
 * Actually writes the DID key backup to the Pod.
 */
async function writeDidKeyBackupToPod(
  containerUri: string,
  keyBackupData: any,
  authenticatedFetch: typeof fetch
) {
  const blob = new Blob([JSON.stringify(keyBackupData)], {
    type: 'application/json'
  });
  await overwriteFile(`${containerUri}${DID_KEYS_FILE}`, blob, {
    contentType: 'application/json',
    fetch: authenticatedFetch
  });
}

/**
 * Back up DID keys to SOLID POD (top-level API)
 */
export async function backupDidKeys(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { connectionInfo } = await requireSolidPodConnection();
    const { keyPair, did } = await getDidKeyBackupData();
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const containerUri = `${baseUrl}/${WALLET_CONTAINER_PATH}`;
    await ensureContainerExist(containerUri, authenticatedFetch);
    const keyBackupData = {
      didKeyPair: keyPair,
      did,
      createdAt: new Date().toISOString(),
      device: 'DitlabWallet Mobile'
    };
    await writeDidKeyBackupToPod(
      containerUri,
      keyBackupData,
      authenticatedFetch as unknown as typeof fetch
    );
    return {
      success: true,
      message: 'DID keys successfully backed up to SOLID POD'
    };
  } catch (error: any) {
    log.error('Error backing up keys:', error);
    return {
      success: false,
      message: `Failed to back up keys: ${error.message}`
    };
  }
}

/**
 * Restore DID keys from SOLID POD
 */
export async function restoreDidKeys(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Check connection status
    const { isConnected, connectionInfo } =
      await solidAuth.checkConnectionStatus();
    if (!isConnected || !connectionInfo) {
      return {
        success: false,
        message: 'Not connected to SOLID POD'
      };
    }

    // Get authenticated fetch function
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Get file path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const fileUrl = `${baseUrl}/${WALLET_CONTAINER_PATH}${DID_KEYS_FILE}`;

    // Get file
    const response = await authenticatedFetch(fileUrl);

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch keys file: ${response.status} ${response.statusText}`
      };
    }

    // Get file content as text
    const fileText = await response.text();
    const keyData = JSON.parse(fileText);

    // Validate key data
    if (!keyData.didKeyPair || !keyData.did) {
      return {
        success: false,
        message: 'Invalid key data in SOLID POD'
      };
    }

    // Store keys
    await storeData(StorageKeyEnums.DID_KEY_PAIR, keyData.didKeyPair);

    // Update DID in AuthData
    const authData = await getData(StorageKeyEnums.AUTH_DATA);
    if (authData) {
      await storeData(StorageKeyEnums.AUTH_DATA, {
        ...authData,
        did: keyData.did
      });
    }

    return {
      success: true,
      message: 'DID keys successfully restored from SOLID POD'
    };
  } catch (error) {
    log.error('Error restoring keys:', error);
    return {
      success: false,
      message: `Failed to restore keys: ${error.message}`
    };
  }
}

/**
 * Extract UUID from credential ID (urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb)
 */
function extractUuidFromCredentialId(credentialId: string): string {
  // Check if ID starts with 'urn:uuid:'
  if (credentialId.startsWith('urn:uuid:')) {
    return credentialId.substring(9); // Remove 'urn:uuid:' prefix
  }
  // If not in expected format, return original to avoid errors
  return credentialId;
}

/**
 * Extract first part of UUID from credential ID
 * (e.g., from urn:uuid:5abfc566-74bf-4cfd-8440-ec94ed892fdb to 5abfc566)
 */
function extractUuidFirstSegment(credentialId: string): string {
  try {
    // Check if ID starts with 'urn:uuid:'
    if (credentialId.startsWith('urn:uuid:')) {
      const uuid = credentialId.substring(9); // Remove 'urn:uuid:' prefix
      const firstSegment = uuid.split('-')[0]; // Get first segment before '-'
      if (firstSegment && firstSegment.length > 0) {
        return firstSegment;
      }
    }
    // If not in expected format, generate a safe filename from original
    return credentialId.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 16);
  } catch (error) {
    // Fallback to a safe string if any error occurs
    return credentialId.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 16);
  }
}

/**
 * Back up a single credential to SOLID POD
 */
export async function backupSingleCredential(credential: VcIdModel): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get connection info
    const { connectionInfo } = await requireSolidPodConnection();

    // Get UUID for this credential
    const uuid = await assignCredentialUuid(credential);

    // Get authenticated fetch
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Create wallet and credentials container paths
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const walletContainerUri = `${baseUrl}/${WALLET_CONTAINER_PATH}`;
    const credentialsContainerUri = `${walletContainerUri}${SOLID_JSON_BACKUP.CREDENTIALS_DIRECTORY}`;

    // Create containers if they don't exist
    await ensureContainerExist(walletContainerUri, authenticatedFetch);
    await ensureContainerExist(credentialsContainerUri, authenticatedFetch);

    // Save credential with UUID as filename
    const blob = new Blob([JSON.stringify(credential)], {
      type: 'application/json'
    });

    await overwriteFile(`${credentialsContainerUri}${uuid}.json`, blob, {
      contentType: 'application/json',
      fetch: authenticatedFetch as unknown as typeof fetch
    });

    return {
      success: true,
      message: `Credential successfully backed up with ID: ${uuid}`
    };
  } catch (error) {
    log.error('Error backing up credential:', error);
    return {
      success: false,
      message: `Failed to back up credential: ${error.message}`
    };
  }
}

/**
 * Store a mapping of short IDs to full credential IDs
 * This helps during restoration to know which short ID maps to which credential
 */
async function storeShortIdMapping(
  fullId: string,
  shortId: string
): Promise<void> {
  try {
    // Check connection status
    const { isConnected, connectionInfo } =
      await solidAuth.checkConnectionStatus();
    if (!isConnected || !connectionInfo) {
      return;
    }

    // Get authenticated fetch function
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Create wallet container path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const mapFilePath = `${baseUrl}/${WALLET_CONTAINER_PATH}${SOLID_JSON_BACKUP.ID_CREDENTIALS_MAPPING_JSON_FILE}`;

    let idMapping = {};

    // Try to get existing mapping
    try {
      const response = await authenticatedFetch(mapFilePath);
      if (response.ok) {
        const text = await response.text();
        idMapping = JSON.parse(text);
      }
    } catch (e) {
      // No existing mapping, create new one
    }

    // Add new mapping
    idMapping[shortId] = fullId;

    // Save mapping
    const blob = new Blob([JSON.stringify(idMapping)], {
      type: 'application/json'
    });

    await overwriteFile(mapFilePath, blob, {
      contentType: 'application/json',
      fetch: authenticatedFetch as unknown as typeof fetch
    });
  } catch (error) {
    log.warn('Error storing ID mapping:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Back up all credentials to SOLID POD
 */
export async function backupCredentials(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get all credentials
    const credentials = await getData(StorageKeyEnums.CREDENTIALS);
    if (!credentials) {
      log.warn('No credentials found to back up');
      return {
        success: false,
        message: 'No credentials found to back up'
      };
    }

    // Log how many credentials we found
    const credentialCount = Object.keys(credentials).length;

    let successCount = 0;
    let failCount = 0;

    // Iterate through each credential and back it up
    for (const key in credentials) {
      try {
        const credential = credentials[key];

        const result = await backupSingleCredential(credential);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          log.warn(`Failed to back up credential ${key}: ${result.message}`);
        }
      } catch (error) {
        failCount++;
        log.error(`Error backing up credential ${key}:`, error);
      }
    }

    return {
      success: successCount > 0,
      message: `Backed up ${successCount} of ${credentialCount} credentials to SOLID POD`
    };
  } catch (error) {
    log.error('Error backing up credentials:', error);
    return {
      success: false,
      message: `Failed to back up credentials: ${error.message}`
    };
  }
}

/**
 * Back up compact UUID mapping to SOLID POD
 */
export async function backupUuidMapping(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get connection info
    const { isConnected, connectionInfo } =
      await solidAuth.checkConnectionStatus();
    if (!isConnected || !connectionInfo) {
      return {
        success: false,
        message: 'Not connected to SOLID POD'
      };
    }

    // Get the mapping
    const mapping = await getCompactMapping();

    // Get authenticated fetch
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Create wallet container path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const walletContainerUri = `${baseUrl}/${WALLET_CONTAINER_PATH}`;

    // Create container if it doesn't exist
    await ensureContainerExist(walletContainerUri, authenticatedFetch);

    // Create blob from mapping data
    const blob = new Blob([JSON.stringify(mapping)], {
      type: 'application/json'
    });

    // Save mapping file
    await overwriteFile(`${walletContainerUri}uuid_mapping.json`, blob, {
      contentType: 'application/json',
      fetch: authenticatedFetch as unknown as typeof fetch
    });

    return {
      success: true,
      message: `UUID mapping successfully backed up (${Object.keys(mapping).length} entries)`
    };
  } catch (error) {
    log.error('Error backing up UUID mapping:', error);
    return {
      success: false,
      message: `Failed to back up UUID mapping: ${error.message}`
    };
  }
}
/**
 * Restore compact UUID mapping from SOLID POD
 */
export async function restoreUuidMapping(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get connection info
    const { connectionInfo } = await requireSolidPodConnection();

    // Get authenticated fetch
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Get mapping file path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const mappingPath = `${baseUrl}/${WALLET_CONTAINER_PATH}uuid_mapping.json`;

    // Get mapping file
    const response = await authenticatedFetch(mappingPath);

    if (!response.ok) {
      log.warn(`Mapping file not found: ${response.status}`);
      return {
        success: false,
        message: 'UUID mapping file not found in Pod'
      };
    }

    // Parse mapping
    const mappingText = await response.text();
    const mapping = JSON.parse(mappingText);
    const mappingCount = Object.keys(mapping).length;

    // Save mapping locally
    await saveCompactMapping(mapping);

    return {
      success: true,
      message: `Successfully restored credential mapping (${mappingCount} entries)`
    };
  } catch (error) {
    log.error('Error restoring UUID mapping:', error);
    return {
      success: false,
      message: `Failed to restore UUID mapping: ${error.message}`
    };
  }
}

/**
 * Back up all data to SOLID POD
 */
export async function backupAllData(): Promise<{
  success: boolean;
  message: string;
  details: {
    didKeys: boolean;
    credentials: boolean;
    uuidMapping: boolean;
  };
}> {
  try {
    // Check connection status
    const { isConnected } = await solidAuth.checkConnectionStatus();
    if (!isConnected) {
      return {
        success: false,
        message: 'Not connected to SOLID POD',
        details: {
          didKeys: false,
          credentials: false,
          uuidMapping: false
        }
      };
    }

    // Track what we've backed up successfully
    const details = {
      didKeys: false,
      credentials: false,
      uuidMapping: false
    };

    // Backup UUID mapping first
    const uuidResult = await backupUuidMapping();
    details.uuidMapping = uuidResult.success;

    // Backup individual data types
    const didResult = await backupDidKeys();
    details.didKeys = didResult.success;

    const credResult = await backupCredentials();
    details.credentials = credResult.success;

    // Overall success if any component succeeded
    const overallSuccess =
      details.didKeys || details.credentials || details.uuidMapping;

    return {
      success: overallSuccess,
      message: overallSuccess
        ? 'Successfully backed up wallet data to SOLID POD'
        : 'Failed to back up any wallet data',
      details
    };
  } catch (error) {
    log.error('Error backing up all data:', error);
    return {
      success: false,
      message: `Failed to back up data: ${error.message}`,
      details: {
        didKeys: false,
        credentials: false,
        uuidMapping: false
      }
    };
  }
}

/**
 * Restore all data from Solid Pod (only DID keys and credentials)
 */
export async function restoreAllData(): Promise<{
  success: boolean;
  message: string;
  details: {
    didKeys: boolean;
    credentials: boolean;
    uuidMapping: boolean;
  };
}> {
  try {
    // Check connection status
    const { isConnected } = await solidAuth.checkConnectionStatus();
    if (!isConnected) {
      return {
        success: false,
        message: 'Not connected to SOLID POD',
        details: {
          didKeys: false,
          credentials: false,
          uuidMapping: false
        }
      };
    }

    // Track what we've restored successfully
    const details = {
      didKeys: false,
      credentials: false,
      uuidMapping: false
    };

    // Restore UUID mapping first (needed for credentials)
    const uuidResult = await restoreUuidMapping();
    details.uuidMapping = uuidResult.success;

    // Restore DID keys
    const didResult = await restoreDidKeys();
    details.didKeys = didResult.success;

    // Restore credentials - use the existing restoreCredentials function
    const credResult = await restoreCredentials();
    details.credentials = credResult.success;

    // Overall success if any component succeeded
    const overallSuccess =
      details.didKeys || details.credentials || details.uuidMapping;

    return {
      success: overallSuccess,
      message: overallSuccess
        ? 'Successfully restored wallet data from SOLID POD'
        : 'Failed to restore any wallet data',
      details
    };
  } catch (error) {
    log.error('Error restoring all data:', error);
    return {
      success: false,
      message: `Failed to restore data: ${error.message}`,
      details: {
        didKeys: false,
        credentials: false,
        uuidMapping: false
      }
    };
  }
}

/**
 * Check what wallet data is available on the Pod
 */
export async function checkPodBackupStatus(): Promise<{
  success: boolean;
  message: string;
  available: {
    didKeys: boolean;
    credentials: boolean;
    credentialCount: number;
  };
}> {
  // Only catch errors at the top level
  try {
    const { isConnected, connectionInfo } =
      await solidAuth.checkConnectionStatus();
    if (!isConnected || !connectionInfo) {
      throw new Error('Not connected to SOLID POD');
    }

    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';

    const available = {
      didKeys: false,
      credentials: false,
      credentialCount: 0
    };

    // Check DID keys file
    const didResponse = await authenticatedFetch(
      `${baseUrl}/${WALLET_CONTAINER_PATH}${DID_KEYS_FILE}`
    );
    available.didKeys = didResponse.ok;

    // Check credentials
    const listResult = await listCredentialsInPod();
    available.credentials = !!(
      listResult.success &&
      listResult.credentialIds &&
      listResult.credentialIds.length > 0
    );
    available.credentialCount = listResult.credentialIds?.length || 0;

    return {
      success: true,
      message:
        available.didKeys || available.credentials
          ? 'Backup files found on SOLID POD'
          : 'No backup files found on SOLID POD',
      available
    };
  } catch (error: any) {
    log.error('Error checking backup status:', error);
    throw new Error(`Failed to check backup status: ${error.message || error}`);
  }
}

/**
 * List all available credential files in the Pod
 */
export async function listCredentialsInPod(): Promise<{
  success: boolean;
  message: string;
  credentialIds?: string[];
}> {
  try {
    // Check connection status
    const { connectionInfo } = await requireSolidPodConnection();

    // Get authenticated fetch
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Get credentials directory path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const credentialsDir = `${baseUrl}/${WALLET_CONTAINER_PATH}${SOLID_JSON_BACKUP.CREDENTIALS_DIRECTORY}`;

    // Try to get dataset (directory listing)
    try {
      const dataset = await getSolidDataset(credentialsDir, {
        fetch: authenticatedFetch as unknown as typeof fetch
      });

      // Get all resource URLs in this container
      const resourceUrls = getContainedResourceUrlAll(dataset);

      // Filter for JSON files only and extract UUIDs
      const credentialIds = resourceUrls
        .filter((url) => url.endsWith('.json'))
        .map((url) => {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          return filename.replace('.json', '');
        });

      return {
        success: true,
        message: `Found ${credentialIds.length} credentials in Pod`,
        credentialIds
      };
    } catch (error) {
      // Directory might not exist yet
      log.warn('Error listing credentials directory:', error);
      return {
        success: false,
        message: 'No credentials directory found in Pod',
        credentialIds: []
      };
    }
  } catch (error) {
    log.error('Error listing credentials in Pod:', error);
    return {
      success: false,
      message: `Failed to list credentials: ${error.message}`,
      credentialIds: []
    };
  }
}

/**
 * Restore a single credential from SOLID POD
 */
export async function restoreSingleCredential(uuid: string): Promise<{
  success: boolean;
  message: string;
  credential?: VcIdModel;
}> {
  try {
    // Get connection info
    const { connectionInfo } = await requireSolidPodConnection();

    // Get authenticated fetch
    const authenticatedFetch = await solidAuth.getAuthenticatedFetch();

    // Get file path
    const baseUrl = connectionInfo.webId?.replace('/profile/card#me', '') || '';
    const filePath = `${baseUrl}/${WALLET_CONTAINER_PATH}${SOLID_JSON_BACKUP.CREDENTIALS_DIRECTORY}${uuid}.json`;

    // Get file
    const response = await authenticatedFetch(filePath);

    if (!response.ok) {
      log.warn(`Credential file not found: ${uuid}`);
      return {
        success: false,
        message: `Credential file not found: ${response.status} ${response.statusText}`
      };
    }

    // Parse file content
    const fileText = await response.text();
    let credential;

    try {
      // First try parsing as direct credential
      credential = JSON.parse(fileText);

      // Check if this is a wrapper with a credential property

      // Basic validation of credential structure
      if (!credential.type || !credential.issuer) {
        throw new Error('Invalid credential structure');
      }

      return {
        success: true,
        message: 'Credential successfully restored from SOLID POD',
        credential
      };
    } catch (parseError) {
      log.error(`Error parsing credential ${uuid}:`, parseError);
      return {
        success: false,
        message: `Invalid credential data: ${parseError.message}`
      };
    }
  } catch (error) {
    log.error(`Error restoring credential ${uuid}:`, error);
    return {
      success: false,
      message: `Failed to restore credential: ${error.message}`
    };
  }
}

/**
 * Restore all credentials from SOLID POD
 */
export async function restoreCredentials(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // List available credentials
    const listResult = await listCredentialsInPod();

    if (
      !listResult.success ||
      !listResult.credentialIds ||
      listResult.credentialIds.length === 0
    ) {
      return {
        success: false,
        message: 'No credentials found in SOLID POD'
      };
    }

    // Track success
    let successCount = 0;
    let failCount = 0;

    // Initialize credentials object
    const mergedCredentials = {};

    // Restore each credential
    for (const uuid of listResult.credentialIds) {
      try {
        const result = await restoreSingleCredential(uuid);

        if (result.success && result.credential) {
          // Add to merged credentials - use time-based key for consistency
          const timeKey =
            result.credential.issuanceDate ||
            result.credential.validFrom ||
            result.credential.proof?.created;
          mergedCredentials[timeKey] = result.credential;
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        log.error(`Error restoring credential ${uuid}:`, e);
        failCount++;
      }
    }

    if (successCount > 0) {
      // Get existing credentials
      const existingCredentials =
        (await getData(StorageKeyEnums.CREDENTIALS)) || {};

      // Merge with existing credentials
      const allCredentials = { ...existingCredentials, ...mergedCredentials };

      // Store merged credentials
      await storeData(StorageKeyEnums.CREDENTIALS, allCredentials);
    }

    return {
      success: successCount > 0,
      message: `Restored ${successCount} credentials from SOLID POD (${failCount} failed)`
    };
  } catch (error) {
    log.error('Error restoring credentials:', error);
    return {
      success: false,
      message: `Failed to restore credentials: ${error.message}`
    };
  }
}

// Re-export authentication methods for backward compatibility
export const checkConnectionStatus =
  solidAuth.checkConnectionStatus.bind(solidAuth);
export const loginWithPassword = solidAuth.loginWithPassword.bind(solidAuth);
export const disconnect = solidAuth.disconnect.bind(solidAuth);
export const getAccessToken = solidAuth.getAccessToken.bind(solidAuth);
export const getAuthenticatedFetch =
  solidAuth.getAuthenticatedFetch.bind(solidAuth);
