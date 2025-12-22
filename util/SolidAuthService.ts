import { getData, storeData } from './EncryptedStorage';
import log from './ReactLogger';
import base64 from 'base-64';
import {
  DEFAULT_ISSUER,
  Demo_WebId,
  StorageKeyEnums
} from '../constants/const';

// Demo account constants

// Connection info type
export interface ConnectionInfo {
  webId?: string;
  issuer?: string;
  tokenExpiryTime?: number;
  credentials?: any;
}

export class SolidAuthService {
  /**
   * Check if the user is connected to a SOLID POD
   */
  async checkConnectionStatus(): Promise<{
    isConnected: boolean;
    connectionInfo: ConnectionInfo | null;
  }> {
    try {
      // Get stored credentials
      const credentials = await getData(StorageKeyEnums.SOLID_DATA);

      if (!credentials || !credentials.tokens) {
        return { isConnected: false, connectionInfo: null };
      }

      // Get token expiry
      const tokenExpiry = credentials.tokens?.expiryTime;
      const isExpired = !tokenExpiry || Date.now() > tokenExpiry;

      // If token is expired, try to refresh it
      if (isExpired) {
        try {
          await this.getAccessToken();
        } catch (error) {
          log.warn('Token refresh failed:', error);
          return { isConnected: false, connectionInfo: null };
        }
      }

      // Connection info
      const solidData = await getData(StorageKeyEnums.SOLID_DATA);
      const webId = solidData?.webId || Demo_WebId;

      return {
        isConnected: true,
        connectionInfo: {
          webId: webId,
          issuer: solidData?.podProvider || DEFAULT_ISSUER,
          tokenExpiryTime: solidData?.tokens?.expiryTime || 0,
          credentials: solidData?.tokens || {}
        }
      };
    } catch (error) {
      log.error('Error checking connection status:', error);
      return { isConnected: false, connectionInfo: null };
    }
  }

  /**
   * Connect to SOLID POD using email and password
   */
  async loginWithPassword(
    email: string,
    password: string,
    webId?: string
  ): Promise<{
    isConnected: boolean;
    connectionInfo: ConnectionInfo | null;
    message: string;
  }> {
    try {
      const issuer = DEFAULT_ISSUER;

      // Store issuer
      const solidData = (await getData(StorageKeyEnums.SOLID_DATA)) || {};

      solidData.podProvider = issuer;

      // Step 1: Get authorization token
      const authToken = await this.getAuthToken(email, password, issuer);

      // Step 2: Generate client credentials
      const credentials = await this.generateClientCredentials(
        authToken,
        webId || this.deriveWebIdFromEmail(email, issuer),
        issuer
      );

      // Update Solid data
      solidData.tokens = credentials;

      // Store WebID
      if (webId) {
        solidData.webId = webId;
      } else {
        solidData.webId = this.deriveWebIdFromEmail(email, issuer);
      }

      // Save all Solid data
      await storeData(StorageKeyEnums.SOLID_DATA, solidData);

      // Step 3: Get access token
      const accessTokenResult = await this.getAccessToken();

      return {
        isConnected: true,
        connectionInfo: {
          webId: webId || this.deriveWebIdFromEmail(email, issuer),
          issuer,
          tokenExpiryTime: accessTokenResult.expiryTime,
          credentials
        },
        message: 'Connected to SOLID POD successfully'
      };
    } catch (error) {
      log.error('Connection error:', error);
      return {
        isConnected: false,
        connectionInfo: null,
        message: `Failed to connect: ${error.message}`
      };
    }
  }

  /**
   * Disconnect from SOLID POD
   */
  async disconnect(): Promise<{
    isConnected: boolean;
    message: string;
  }> {
    try {
      await storeData(StorageKeyEnums.SOLID_DATA, {
        lastUpdated: new Date().toISOString(),
        webId: null,
        podProvider: null,
        tokens: null
      });

      // Double-check that we're disconnected
      const connectionStatus = await this.checkConnectionStatus();

      return {
        isConnected: connectionStatus.isConnected,
        message: connectionStatus.isConnected
          ? 'Warning: Still connected to SOLID POD'
          : 'Disconnected from SOLID POD'
      };
    } catch (error) {
      log.error('Disconnect error:', error);
      return {
        isConnected: false,
        message: 'Disconnected from SOLID POD'
      };
    }
  }

  /**
   * Get authentication token using email and password
   */
  async getAuthToken(
    email: string,
    password: string,
    issuer: string
  ): Promise<string> {
    try {
      const indexResponse = await fetch(`${issuer}.account/`);

      if (!indexResponse.ok) {
        throw new Error(
          `Failed to access account service: ${indexResponse.status}`
        );
      }

      const { controls } = await indexResponse.json();

      // Login with password
      const response = await fetch(controls.password.login, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error(`Login failed: ${response.status} - ${errorText}`);
        throw new Error('Invalid credentials');
      }

      // Get authorization token
      const { authorization } = await response.json();

      // Store for future use
      const solidData = (await getData(StorageKeyEnums.SOLID_DATA)) || {};
      solidData.authToken = authorization;
      await storeData(StorageKeyEnums.SOLID_DATA, solidData);
      return authorization;
    } catch (error) {
      log.error('Auth error:', error);
      throw error;
    }
  }

  /**
   * Generate client credentials
   */
  async generateClientCredentials(
    token: string,
    webId: string,
    issuer: string
  ): Promise<any> {
    // Get authenticated controls
    const indexResponse = await fetch(`${issuer}.account/`, {
      headers: { authorization: `CSS-Account-Token ${token}` }
    });

    if (!indexResponse.ok) {
      throw new Error(
        `Failed to access authenticated controls: ${indexResponse.status}`
      );
    }

    const { controls } = await indexResponse.json();

    // Use provided WebID

    // Request for client credentials
    const response = await fetch(controls.account.clientCredentials, {
      method: 'POST',
      headers: {
        authorization: `CSS-Account-Token ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: `ditlabwallet-${Date.now()}`,
        webId: webId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate credentials');
    }

    const credentials = await response.json();
    return credentials;
  }

  /**
   * Get an OAuth access token using client credentials
   */
  async getAccessToken(): Promise<{
    accessToken: string;
    expiryTime: number;
  }> {
    try {
      // Get the stored client credentials from SolidData
      const solidData = (await getData(StorageKeyEnums.SOLID_DATA)) as any;
      if (
        !solidData ||
        !solidData.tokens ||
        !solidData.tokens.id ||
        !solidData.tokens.secret
      ) {
        throw new Error('No client credentials available');
      }

      const credentials = solidData.tokens;
      const issuer = solidData.podProvider || DEFAULT_ISSUER;

      if (!credentials || !credentials.id || !credentials.secret) {
        throw new Error('No client credentials available');
      }

      // Get OIDC configuration
      const configResponse = await fetch(
        `${issuer}.well-known/openid-configuration`
      );

      if (!configResponse.ok) {
        throw new Error(
          `Failed to get OIDC configuration: ${configResponse.status}`
        );
      }

      const config = await configResponse.json();
      const tokenUrl = config.token_endpoint || `${issuer}.oidc/token`;

      // Create auth string and encode it
      const authString = `${encodeURIComponent(credentials.id)}:${encodeURIComponent(credentials.secret)}`;

      // Request access token
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          authorization: `Basic ${base64.encode(authString)}`,
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=webid'
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        log.error(
          `Token request failed: ${tokenResponse.status} - ${errorText}`
        );
        throw new Error('Failed to get access token');
      }

      const { access_token: accessToken, expires_in } =
        await tokenResponse.json();

      // Calculate expiry time
      const expiryTime = Date.now() + expires_in * 1000 - 60000; // Subtract 1 minute buffer

      // Store token and expiry time in solidData
      solidData.tokens.accessToken = accessToken;
      solidData.tokens.expiryTime = expiryTime;
      await storeData(StorageKeyEnums.SOLID_DATA, solidData);

      return { accessToken, expiryTime };
    } catch (error) {
      log.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Create an authenticated fetch function
   */
  async getAuthenticatedFetch(): Promise<
    (url: string, options?: any) => Promise<Response>
  > {
    // Get access token
    const { accessToken } = await this.getAccessToken();

    // Return authenticated fetch function
    return (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`
        }
      });
    };
  }

  /**
   * Derive WebID from email
   */
  deriveWebIdFromEmail(email: string, issuer: string = DEFAULT_ISSUER): string {
    const username = email.split('@')[0];
    return `${issuer}${username}Pod/profile/card#me`;
  }
}

// Create singleton instance
export const solidAuth = new SolidAuthService();
