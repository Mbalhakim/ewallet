import EncryptedStorage from 'react-native-encrypted-storage';
import { TypeName, ObjectType, SolidData, IssuerData } from './types/Storage';
import { SavedCredentials, VcIdModel } from './types/Credential';
import log from './ReactLogger';
import { VerifiablePresentation } from './types/VerifiablePresentation';
import { assignCredentialUuid } from './CredentialUuidMapper';
import { StorageKeyEnums } from '../constants/const';

// Map StorageKey enum values to TypeName strings
type StorageKeyToTypeNameMap = {
  [K in StorageKeyEnums]: TypeName;
};

const storageKeyToTypeName: StorageKeyToTypeNameMap = {
  [StorageKeyEnums.AUTH_DATA]: 'AuthData',
  [StorageKeyEnums.CREDENTIALS]: 'credentials',
  [StorageKeyEnums.DID_KEY_PAIR]: 'DidKeyPair',
  [StorageKeyEnums.LAST_JWT]: 'LastJWT',
  [StorageKeyEnums.ISSUER_DATA]: 'issuerData',
  [StorageKeyEnums.SOLID_DATA]: 'solidData',
  [StorageKeyEnums.PRESENTATIONS]: 'presentations',
  [StorageKeyEnums.CREDENTIAL_REQUESTS]: 'credentialRequests'
};

/**
 * Retrieves the value from the encrypted storage
 * @param key key to retrieve the value from StorageKey enum
 * @returns the value as an object
 * @returns empty object if the key does not exist
 */
export const getData = async <K extends StorageKeyEnums>(
  key: K
): Promise<ObjectType<StorageKeyToTypeNameMap[K]>> => {
  try {
    const value = await EncryptedStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as ObjectType<StorageKeyToTypeNameMap[K]>;
    }

    // Return empty object if no value found
    return {} as unknown as ObjectType<StorageKeyToTypeNameMap[K]>;
  } catch (error) {
    log.error(`Error retrieving data for key ${key}:`, error);
    throw new Error(`Failed to retrieve data: ${error}`);
  }
};

/**
 * Stores data in the encrypted storage
 * @param key key from StorageKey enum
 * @param data data to store
 */
export const storeData = async <K extends StorageKeyEnums>(
  key: K,
  data: ObjectType<StorageKeyToTypeNameMap[K]>
) => {
  try {
    await EncryptedStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    log.error(`Error storing data for key ${key}:`, error);
    throw new Error(`Failed to store data: ${error}`);
  }
};

/**
 * Concatenates two objects
 * @param obj1 first object
 * @param obj2 second object
 * @returns the concatenated object
 */
export const concatenateObject = (obj1: object, obj2: object): object => {
  return { ...obj1, ...obj2 };
};

/**
 * Stores the credential in the encrypted storage
 * @param credential the credential to be stored
 * @returns void
 */
export const storeCredential = async (credential: VcIdModel): Promise<void> => {
  try {
    // Automatically assign UUID when storing a credential
    const uuid = await assignCredentialUuid(credential);
    log.info(`Assigned UUID ${uuid} to credential`);

    // Continue with normal credential storage
    const credentials = await getData(StorageKeyEnums.CREDENTIALS);
    const created =
      credential.validFrom || credential.issuanceDate || credential.issued;

    // unique key using UUID + timestamp
    const uniqueKey = `${created}_${uuid}`;
    const toStore = { [uniqueKey]: credential };
    const allCredentials = {
      ...credentials,
      ...toStore
    } as SavedCredentials;
    await storeData(StorageKeyEnums.CREDENTIALS, allCredentials);

    log.info('Credential stored successfully');
  } catch (error) {
    log.error('Error storing credential:', error);
    throw error;
  }
};

export const deleteCredential = async (key: string): Promise<void> => {
  log.info('Deleting credential with key:', key);
  try {
    // Delete from original storage
    const credentials = await getData(StorageKeyEnums.CREDENTIALS);
    if (Object.keys(credentials).length > 0) {
      if (credentials[key]) {
        log.info('Found credential in original storage');
        delete credentials[key];
        await storeData(StorageKeyEnums.CREDENTIALS, credentials);
      } else {
        log.warn(`Credential with key ${key} not found.`);
      }
    } else {
      log.warn('No credentials found in storage.');
    }

    // delete from issuerData storage
    const issuerData = await getIssuerData();
    if (issuerData.credentials && issuerData.credentials[key]) {
      log.info('Found credential in issuerData storage');
      delete issuerData.credentials[key];
      issuerData.lastUpdated = new Date().toISOString();
      await storeData(StorageKeyEnums.ISSUER_DATA, issuerData);
    }
  } catch (error) {
    log.error('Error deleting credential:', error);
  }
};

/**
 * Gets the issuer data JSON
 */
export const getIssuerData = async (): Promise<IssuerData> => {
  try {
    const issuerData = (await getData(
      StorageKeyEnums.ISSUER_DATA
    )) as IssuerData;

    // Initialize structure if it doesn't exist
    const result: IssuerData = {
      issuers: issuerData.issuers || {},
      credentials: issuerData.credentials || {},
      lastUpdated: issuerData.lastUpdated || new Date().toISOString()
    };

    return result;
  } catch (error) {
    log.error('Error getting issuer data:', error);
    return {
      issuers: {},
      credentials: {},
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Stores the  issuer data
 */
export const storeIssuerData = async (
  issuerData: IssuerData
): Promise<void> => {
  issuerData.lastUpdated = new Date().toISOString();
  await storeData(StorageKeyEnums.ISSUER_DATA, issuerData);
};

/**
 * Updates information about an issuer
 */
export const updateIssuerInfo = async (
  issuerId: string,
  info: Partial<IssuerData['issuers'][string]>
): Promise<void> => {
  const issuerData = await getIssuerData();

  if (!issuerData.issuers[issuerId]) {
    issuerData.issuers[issuerId] = {};
  }

  // Update provided fields
  Object.assign(issuerData.issuers[issuerId], info);
  issuerData.issuers[issuerId].lastInteraction = new Date().toISOString();

  issuerData.lastUpdated = new Date().toISOString();
  await storeIssuerData(issuerData);
};

/**
 * Gets the Solid data JSON
 */
export const getSolidData = async (): Promise<SolidData> => {
  try {
    const solidData = (await getData(StorageKeyEnums.SOLID_DATA)) as SolidData;

    // Ensure we have a valid lastUpdated property
    if (!solidData.lastUpdated) {
      solidData.lastUpdated = new Date().toISOString();
    }

    return solidData;
  } catch (error) {
    log.error('Error getting Solid data:', error);
    return {
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Stores the  Solid data
 */
export const storeSolidData = async (solidData: SolidData): Promise<void> => {
  solidData.lastUpdated = new Date().toISOString();
  await storeData(StorageKeyEnums.SOLID_DATA, solidData);
};

/**
 * Updates the Solid account information
 */
export const updateSolidAccount = async (
  accountInfo: Partial<
    Pick<SolidData, 'webId' | 'podProvider' | 'username' | 'email'>
  >
): Promise<void> => {
  const solidData = await getSolidData();

  // Update the provided fields
  Object.assign(solidData, accountInfo);

  solidData.lastUpdated = new Date().toISOString();
  await storeSolidData(solidData);
};

/**
 * Updates the Solid authentication tokens
 */
export const updateSolidTokens = async (
  tokens: SolidData['tokens']
): Promise<void> => {
  const solidData = await getSolidData();
  solidData.tokens = tokens;
  solidData.lastUpdated = new Date().toISOString();
  await storeSolidData(solidData);
};

/**
 * Exports all wallet data as JSON for backup or Solid Pod storage
 */
export const exportWalletData = async (): Promise<string> => {
  try {
    const issuerData = await getIssuerData();
    const solidData = await getSolidData();
    const credentials = await getData(StorageKeyEnums.CREDENTIALS);
    const presentations = await getData(StorageKeyEnums.PRESENTATIONS);
    const credentialRequests = await getData(
      StorageKeyEnums.CREDENTIAL_REQUESTS
    );

    const exportData = {
      issuerData,
      solidData,
      credentials,
      presentations,
      credentialRequests,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    log.error('Error exporting wallet data:', error);
    throw error;
  }
};

/**
 * Imports wallet data from JSON
 */
export const importWalletData = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData);

    // Import each data type
    if (data.issuerData) {
      await storeData(StorageKeyEnums.ISSUER_DATA, data.issuerData);
    }

    if (data.solidData) {
      await storeData(StorageKeyEnums.SOLID_DATA, data.solidData);
    }

    if (data.credentials) {
      await storeData(StorageKeyEnums.CREDENTIALS, data.credentials);
    }

    if (data.presentations) {
      await storeData(StorageKeyEnums.PRESENTATIONS, data.presentations);
    }

    if (data.credentialRequests) {
      await storeData(
        StorageKeyEnums.CREDENTIAL_REQUESTS,
        data.credentialRequests
      );
    }

    return true;
  } catch (error) {
    log.error('Error importing wallet data:', error);
    return false;
  }
};

/**
 * Retrieves all credentials in both formats
 */
export const getAllCredentials = async (): Promise<{
  legacy: SavedCredentials;
  structured: SavedCredentials;
}> => {
  try {
    // Get from original format
    const legacyCredentials = (await getData(
      StorageKeyEnums.CREDENTIALS
    )) as SavedCredentials;

    // Get from structured format
    const issuerData = await getIssuerData();

    return {
      legacy: legacyCredentials || {},
      structured: issuerData.credentials || {}
    };
  } catch (error) {
    log.error('Error getting all credentials:', error);
    return {
      legacy: {},
      structured: {}
    };
  }
};

/**
 * Stores a verifiable presentation
 * Note: This is a temporary storage for active presentations
 */
export const storeVerifiablePresentation = async (
  presentation: VerifiablePresentation
): Promise<void> => {
  try {
    // Get existing presentations
    const presentations = (await getData(
      StorageKeyEnums.PRESENTATIONS
    )) as Record<string, VerifiablePresentation>;

    // Store the new presentation using its ID as the key
    const updatedPresentations = {
      ...presentations,
      [presentation.id]: presentation
    };

    await storeData(StorageKeyEnums.PRESENTATIONS, updatedPresentations);
    log.info('Stored verifiable presentation:', presentation.id);
  } catch (error) {
    log.error('Error storing verifiable presentation:', error);
    throw error;
  }
};

/**
 * Retrieves a specific credential by its ID
 */
export const getCredentialById = async (
  credentialId: string
): Promise<VcIdModel | null> => {
  try {
    // First try structured storage
    const issuerData = await getIssuerData();

    // Search in issuerData.credentials
    for (const key in issuerData.credentials) {
      if (issuerData.credentials[key].id === credentialId) {
        return issuerData.credentials[key];
      }
    }

    // If not found, try legacy storage
    const credentials = (await getData(
      StorageKeyEnums.CREDENTIALS
    )) as SavedCredentials;

    for (const key in credentials) {
      if (credentials[key].id === credentialId) {
        return credentials[key];
      }
    }

    return null;
  } catch (error) {
    log.error('Error getting credential by ID:', error);
    return null;
  }
};

/**
 * Store credential request details
 * To track pending credential requests
 */
export const storeCredentialRequest = async (requestData: {
  id: string;
  issuer: string;
  type: string;
  created: string;
  status: 'pending' | 'approved' | 'rejected';
}): Promise<void> => {
  try {
    // Get existing requests
    const requests = (await getData(
      StorageKeyEnums.CREDENTIAL_REQUESTS
    )) as Record<string, any>;

    // Add the new request
    const updatedRequests = {
      ...requests,
      [requestData.id]: {
        ...requestData,
        lastUpdated: new Date().toISOString()
      }
    };

    await storeData(StorageKeyEnums.CREDENTIAL_REQUESTS, updatedRequests);
    log.info('Stored credential request:', requestData.id);
  } catch (error) {
    log.error('Error storing credential request:', error);
    throw error;
  }
};
