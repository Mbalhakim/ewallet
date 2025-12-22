import EncryptedStorage from 'react-native-encrypted-storage';
import log from './ReactLogger';
import { TypeName } from './types/Storage';

/**
 * Utility for managing and debugging stored wallet data in localstorage
 */
export class StorageManager {
  private static readonly CORE_KEYS: TypeName[] = ['credentials', 'DidKeyPair'];

  /**
   * Initialize empty or invalid storage structures with default values
   */
  public static async initializeStorage(): Promise<void> {
    log.info('Initializing storage structures...');

    await this.initializeKey('credentials', {});
    await this.initializeKey('DidKeyPair', { publicKey: [], privateKey: [] });

    log.info('Storage initialization complete');
  }

  /**
   * Initialize a specific key with default value if empty
   */
  private static async initializeKey(
    key: string,
    defaultValue: any
  ): Promise<void> {
    try {
      const data = await EncryptedStorage.getItem(key);
      if (!data) {
        await EncryptedStorage.setItem(key, JSON.stringify(defaultValue));
        log.info(`Initialized ${key} with default values`);
      }
    } catch (error) {
      log.error(`Error checking ${key} in storage:`, error);

      throw new Error(`Failed to initialize ${key}: ${error.message}`);
    }
  }

  /**
   * Creates a backup of credentials and DIDKeyPair
   */
  public static async createBackupOfCredentials(): Promise<string> {
    try {
      const credentials = await this.getJsonFromLocalStorage('credentials');
      const didKeyPair = await this.getJsonFromLocalStorage('DidKeyPair');

      const backup = {
        credentials,
        didKeyPair,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const backupJson = JSON.stringify(backup, null, 2);
      const backupSizeKB = (backupJson.length / 1024).toFixed(2);

      log.info(`Wallet backup created successfully (${backupSizeKB} KB)`);
      return backupJson;
    } catch (error) {
      log.error('Error creating backup:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Gets an item from storage and parses it as JSON
   */
  private static async getJsonFromLocalStorage(key: string): Promise<any> {
    try {
      const data = await EncryptedStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      log.warn(`Error getting ${key} from storage:`, error);

      return null;
    }
  }

  /**
   * Clears a specific storage key
   */
  public static async clearLocalStorageByKey(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
      log.info(`Cleared storage key: ${key}`);
    } catch (error) {
      log.error(`Failed to clear ${key}:`, error);
      throw new Error(`Failed to clear ${key}: ${error.message}`);
    }
  }

  /**
   * Clears all storage
   */
  public static async clearAllLocalStorage(): Promise<void> {
    try {
      await EncryptedStorage.clear();
      log.info('All storage cleared');
    } catch (error) {
      log.error('Failed to clear all storage:', error);
      throw new Error(`Failed to clear all storage: ${error.message}`);
    }
  }
}
