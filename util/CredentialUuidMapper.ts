import { v4 as uuidv4 } from 'uuid';
import { getData, storeData } from './EncryptedStorage';
import log from './ReactLogger';
import { StorageKeyEnums } from '../constants/const';

/**
 * This module provides functionality to assign a UUID to a credential,
 * store a compact mapping of UUIDs to credentials, and retrieve them.
 * It ensures that each credential can be uniquely identified by a UUID
 * while maintaining a compact representation of the mapping.
 */
interface CompactMapping {
  [uuid: string]: {
    timestamp: string; // When this mapping was created
    fingerprint: string; // Unique fingerprint for credential
  };
}

/**
 * Creates a unique fingerprint for a credential by converting the entire
 * credential to a JSON string
 * @throws Error if credential cannot be serialized to JSON
 */
function createCredentialFingerprint(credential: any): string {
  if (!credential) {
    throw new Error(
      'Failed to create credential fingerprint: Credential is null or undefined'
    );
  }

  try {
    // Use the entire credential JSON as the fingerprint
    return JSON.stringify(credential);
  } catch (error) {
    log.warn('Error stringifying credential for fingerprint:', error);
    // Re-throw the error to be handled by the caller
    throw new Error(
      'Failed to create credential fingerprint: Unable to stringify credential'
    );
  }
}

/**
 * Assigns a UUID to a credential and stores a compact mapping
 */
export async function assignCredentialUuid(credential: any): Promise<string> {
  try {
    const fingerprint = createCredentialFingerprint(credential);

    // First check if this credential might already have a UUID
    const mapping = await getCompactMapping();

    // Check for existing fingerprint
    for (const [uuid, details] of Object.entries(mapping)) {
      if (details.fingerprint === fingerprint) {
        return uuid;
      }
    }

    // Generate new UUID
    const uuid = uuidv4();

    // Store the compact mapping with fingerprint
    mapping[uuid] = {
      timestamp: new Date().toISOString(),
      fingerprint: fingerprint
    };

    // Save the updated mapping
    await saveCompactMapping(mapping);

    return uuid;
  } catch (error) {
    throw new Error('Failed to assign UUID to credential');
  }
}

/**
 * Get the compact mapping
 */
export async function getCompactMapping(): Promise<CompactMapping> {
  try {
    const data = await getData(StorageKeyEnums.UUID_MAPPING_KEY);
    if (data) {
      return data as CompactMapping;
    }

    // Return empty mapping if none exists
    return {};
  } catch (error) {
    log.error('Error getting compact mapping:', error);
    // Return empty mapping on error
    return {};
  }
}

/**
 * Save the compact mapping
 */
export async function saveCompactMapping(
  mapping: CompactMapping
): Promise<boolean> {
  try {
    await storeData(StorageKeyEnums.UUID_MAPPING_KEY, mapping);
    return true;
  } catch (error) {
    log.error('Error saving compact mapping:', error);
    return false;
  }
}

/**
 * Check if a UUID exists in the mapping
 */
export async function uuidExists(uuid: string): Promise<boolean> {
  try {
    const mapping = await getCompactMapping();
    return !!mapping[uuid];
  } catch (error) {
    log.error(`Error checking if UUID ${uuid} exists:`, error);
    return false;
  }
}
