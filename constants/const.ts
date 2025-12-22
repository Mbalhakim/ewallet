// SOLID POD Configuration
export const DEFAULT_ISSUER = 'https://solidcommunity.net/';
export const Demo_WebId = 'https://demopod1.solidcommunity.net/profile/card#me';
export const DEMO_ACCOUNT = {
  email: 'mipev99812@movfull.com',
  password: 'test123'
};

// SOLID storage paths
export const WALLET_CONTAINER_PATH = 'wallet/';
export const DID_KEYS_FILE = 'did-keys.json';

// SOLID providers configuration
export const SOLID_PROVIDERS = [
  {
    id: 'DitlabPod',
    name: 'DitLab.com',
    url: 'https://pod.ditlab.cloud/',
    color: '#4C8BF5' // Blue
  },
  {
    id: 'solidcommunity',
    name: 'Solid Community',
    url: 'https://solidcommunity.net',
    color: '#28A745' // Green
  },
  {
    id: 'solidweb',
    name: 'SolidWeb.org',
    url: 'https://solidweb.org',
    color: '#6C757D' // Gray
  },
  {
    id: 'Inrupt',
    name: 'Inrupt.com',
    url: 'https://start.inrupt.com/',
    color: '#FFAAAA' // Rose
  }
];

// Storage enum for encrypted storage
export enum StorageKeyEnums {
  AUTH_DATA = 'AuthData',
  CREDENTIALS = 'credentials',
  DID_KEY_PAIR = 'DidKeyPair',
  LAST_JWT = 'LastJWT',
  ISSUER_DATA = 'issuerData',
  SOLID_DATA = 'solidData',
  PRESENTATIONS = 'presentations',
  CREDENTIAL_REQUESTS = 'credentialRequests',
  UUID_MAPPING_KEY = 'credential_compact_mapping'
}

export const SOLID_JSON_BACKUP = {
  //  Wallet back up names for the json data that is being backed up to the Pod
  USER_CREDENTIALS_FILE: 'user-profile.json',
  CREDENTIALS_FILE: 'credentials.json',
  ISSUER_DATA_FILE: 'issuers.json',
  WALLET_BACKUP_FILE: 'wallet-backup.json',
  CREDENTIALS_DIRECTORY: 'credentials/',
  ID_CREDENTIALS_MAPPING_JSON_FILE: 'IDmapping.json'
};
