import { storeCredential } from './EncryptedStorage';
import { decodeJWT } from './JWTService';
import {
  getAuthorizationCode,
  getCredential,
  getWellknownConfig,
  getMetadataParam
} from './RequestService';
import { VcIdModel } from './types/Credential';
import { localhostConverter } from './LocalhostConverter';
import log from './ReactLogger';

const getCredentialOffer = async (offerUri: string) => {
  log.info('Fetching credential offer from URI:', offerUri);
  offerUri = localhostConverter(offerUri, offerUri);
  const response = await fetch(offerUri);
  return await response.json();
};

const fetchCredential = async (
  issuer: string,
  state: string,
  credentialType: string
) => {
  const wellKnown = await getWellknownConfig(issuer);
  const token_endpoint = await getMetadataParam(wellKnown, 'token_endpoint');
  const credential_issuer = await getMetadataParam(
    wellKnown,
    'credential_issuer'
  );

  const authCodeResponse = await getAuthorizationCode(
    state,
    token_endpoint,
    credential_issuer
  );
  const credential_endpoint = await getMetadataParam(
    wellKnown,
    'credential_endpoint'
  );
  const credential = await getCredential(
    credential_endpoint,
    authCodeResponse.access_token,
    credential_issuer,
    credentialType,
    authCodeResponse.c_nonce
  );
  const decodedJwt = decodeJWT(credential.credential) as VcIdModel;
  await storeCredential(decodedJwt);
};

export { getCredentialOffer, fetchCredential };
