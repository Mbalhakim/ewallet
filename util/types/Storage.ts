import { KeyPair } from '@inrupt/solid-client-authn-core';
import { Authdata } from '../DataTypes';
import { SavedCredentials } from './Credential';
import { VerifiablePresentation } from './VerifiablePresentation';

export type TypeName =
  | 'credentials'
  | 'DidKeyPair'
  | 'AuthData'
  | 'LastJWT'
  | 'userCredentials'
  | 'issuerData'
  | 'solidData'
  | 'presentations'
  | 'credentialRequests'
  | 'savedCredentials'
  | 'credential_compact_mapping';

export interface DidKeyPairStorage {
  publicKey: number[];
  privateKey: number[];
}

export interface StoredJwt {
  token: string;
  timestamp: number;
}

export interface DidKeyPair {
  did: string;
  publicKey: string;
  privateKey: string;
  created: string;
}

export interface UserCredentials {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  username?: string;
  did?: string;
  uuid?: string;
  keys?: KeyPair[];
  lastUpdated: string;
}

export interface SolidData {
  webId?: string;
  podProvider?: string;
  username?: string;
  email?: string;
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expired_at?: number;
    secret_token?: string;
  };
  lastUpdated: string;
}

export interface IssuerData {
  issuers: {
    [issuerId: string]: {
      name?: string;
      did?: string;
      url?: string;
      lastInteraction?: string;
    };
  };
  credentials: SavedCredentials;
  lastUpdated: string;
}

export interface CompactMapping {
  [uuid: string]: {
    timestamp: string;
    fingerprint: string;
  };
}

export type ObjectType<T extends TypeName> = T extends 'AuthData'
  ? Authdata
  : T extends 'credentials'
    ? SavedCredentials
    : T extends 'DidKeyPair'
      ? DidKeyPairStorage
      : T extends 'LastJWT'
        ? StoredJwt
        : T extends 'userCredentials'
          ? UserCredentials
          : T extends 'issuerData'
            ? IssuerData
            : T extends 'solidData'
              ? SolidData
              : T extends 'presentations'
                ? Record<string, VerifiablePresentation>
                : T extends 'credentialRequests'
                  ? Record<string, any>
                  : T extends 'credential_compact_mapping'
                    ? CompactMapping
                    : never;
