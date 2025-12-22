import axios, { AxiosResponse } from 'axios';
import log from './ReactLogger';
import { getData } from './EncryptedStorage';
import { RequestBody } from './DataTypes';
import { localhostConverter } from './LocalhostConverter';
import { signJWT, generateJWT } from './JWTService';
import { StorageKeyEnums } from '../constants/const';

/**
 * This function creates a JWT and signs it using the JWT signing service
 *
 * @param did the DID of the user
 * @param username the username of the user
 * @param client_id the client_id
 * @returns the signed JWT
 */
const createAndSignJWT = async (
  client_id: string,
  username: string,
  did: string
): Promise<string | undefined> => {
  try {
    const jwt_content = createJWT(did, username, client_id);
    // Use local signing instead of external service for now this will be udated with issue #199 to handl it on the gemeent side
    return await signJWT(jwt_content.payload);
  } catch (error) {
    console.error('Error signing JWT:', error);
    return undefined;
  }
};
/**
 * This function does the heavy lifting of the SIOPv2 flow
 * The function is called when the user opens the app using a DeepLink URI
 * It sends a POST request to the redirect_uri with the id_token, state and nonce
 * with the id_token being a signed JWT which contains the user's DID and username
 * @see https://openid.net/specs/openid-connect-self-issued-v2-1_0.html
 *
 * @param client_id the client_id passed in the URI "SIOPv2://"
 * @param redirect_uri the redirect_uri passed in the URI "SIOPv2://"
 * @param state the state passed in the URI "SIOPv2://"
 * @param nonce the nonce passed in the URI "SIOPv2://"
 * @returns the response from the server
 */
async function postSiopWrapper(
  client_id: string,
  redirect_uri: string,
  state: string,
  nonce: string
): Promise<AxiosResponse> {
  const userData = await getData(StorageKeyEnums.AUTH_DATA);
  const username = userData.username;
  const did = userData.did;
  const jwt: any = await createAndSignJWT(client_id, username, did);
  const body: RequestBody = { id_token: jwt, state: state, nonce: nonce };
  //Bridge to computer localhost that a Android emulator uses
  redirect_uri = localhostConverter(client_id, redirect_uri);
  const headers = { headers: { 'Content-Type': 'application/json' } };
  return await axios.post(redirect_uri, body, headers);
}

/**
 * This function obtains the well-known config from the issuer in a
 * credential issuance flow.
 * @see https://datatracker.ietf.org/doc/html/rfc5785
 * @see https://openid.net/specs/openid-connect-discovery-1_0.html#WellKnownRegistry
 *
 * @param issuer the issuer of the credential
 * @returns the well-known config as an object
 */
const getWellknownConfig = async (issuer: string): Promise<any> => {
  const headers = { headers: { 'Content-Type': 'application/json' } };
  issuer = localhostConverter(issuer, issuer);
  try {
    const response = await axios.get(
      issuer + '/.well-known/openid-credential-issuer',
      headers
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getMetadataParam = async (
  metadata: Record<string, any>,
  param: string
): Promise<any> => {
  const headers = { headers: { 'Content-Type': 'application/json' } };

  if (!metadata.authorization_servers) {
    const authorization_server = await axios.get(
      metadata.credential_issuer + '/.well-known/oauth-authorization-server',
      headers
    );
    metadata = { ...metadata, ...authorization_server.data };
  }

  if (!metadata[param]) {
    log.error(`${param} was requested but not found in metadata.`);
  }
  return metadata[param];
};

/**
 * This function obtains the authorization code from the authorization server
 * in a credential issuance flow.
 *
 * @see https://openid.net/specs/openid-connect-4-verifiable-credential-issuance-1_0-05.html#name-authorization-endpoint
 *
 * @param state the state obtained from the well-known config
 * @param tokenEndpoint the authorization server obtained from the well-known config
 * @param credential_issuer the issuer for the authorization server
 * @returns the authorization code as an object
 */
const getAuthorizationCode = async (
  state: string,
  tokenEndpoint: string,
  credential_issuer: string
): Promise<any> => {
  tokenEndpoint = localhostConverter(credential_issuer, tokenEndpoint);
  const body = {
    grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
    'pre-authorized_code': state
  };
  const response = await axios.post(tokenEndpoint, body);
  return response.data;
};

/**
 * This function obtains the credential from the credential endpoint, serving as
 * the final step in the credential issuance flow.
 *
 * @see https://openid.net/specs/openid-connect-4-verifiable-credential-issuance-1_0-05.html#name-credential-request
 *
 * @param credential_endpoint the credential endpoint obtained from the well-known config
 * @param access_token the access token obtained from the authorization server
 * @param credential_issuer the issuer for the authorization server
 * @returns the credential as an object
 */
const getCredential = async (
  credential_endpoint: string,
  access_token: string,
  credential_issuer: string,
  credentialType: string,
  c_nonce: string
): Promise<any> => {
  credential_endpoint = localhostConverter(
    credential_issuer,
    credential_endpoint
  );
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`
    }
  };
  const jwt = await generateJWT(credential_issuer, c_nonce);
  const body = {
    format: 'jwt_vc_json',
    credential_definition: {
      type: [credentialType],
      credentialSubject: {}
    },
    proof: {
      proof_type: 'jwt',
      jwt: jwt
    }
  };
  try {
    const response = await axios.post(credential_endpoint, body, headers);
    return response.data;
  } catch (error) {
    if (error.response) {
      log.debug('Error response:', error.response);
      log.error(
        'Server responded with:',
        error.response.status,
        error.response.data
      );
    } else {
      log.error('Request failed:', error.message);
    }
  }
};

/**
 * This function creates a JWT payload
 *
 * @param did the DID of the user
 * @param username the username of the user
 * @param client_id the client_id
 * @returns the JWT payload and the signing algorithm
 */
function createJWT(
  did: string,
  username: string,
  client_id: string
): { payload: object; signingAlgorithm: string } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  return {
    payload: {
      iss: did,
      sub: did,
      name: username,
      iat: iat,
      aud: client_id,
      exp: exp
    },
    signingAlgorithm: 'ES256' // Changed from 'PS256' to 'ES256'
  };
}

export {
  createAndSignJWT,
  postSiopWrapper,
  getWellknownConfig,
  getAuthorizationCode,
  getCredential,
  createJWT,
  getMetadataParam
};
