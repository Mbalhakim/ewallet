/**
 * Authdata is the type of data we will store in the encrypted storage,
 * the username and password are filled by the user the first time he logs in
 * @param username username of the user
 * @param password password of the user
 * @param isLoggedIn boolean to check if the user is logged in or not
 */
export class Authdata {
  username: string; //user input for username
  password: string; //user input for password
  isLoggedIn: boolean; //user is logged in or not(automatically set)
  did: string; //did of the user (automatically set)
}

/**
 * This is the type of a request body for the SIOPv2 flow
 * @param id_token id_token of the user
 * @param state state
 * @param nonce nonce
 */
export interface RequestBody {
  id_token: string;
  state: string;
  nonce: string;
}

/**
 * This is the type for the Credential Subject
 * @see https://www.w3.org/TR/vc-data-model/#credential-subject
 * 
 * @param id the DID of the user
 * @param [key: string] any other data that the user wants to store in the credential
 */
export interface CredentialSubject {
  id: string;
  [key: string]: any;
}

/**
 * This is the type for the Credential Issuer
 * @see https://www.w3.org/TR/vc-data-model/#issuer
 * 
 * @param id the DID of the issuer
 */
export interface CredentialIssuer {
  id: string;
}

/**
 * This is the type used internally for the DeepLink URI parameters
 * @param client_id the client_id passed in the URI "SIOPv2://"
 * @param redirect_uri the redirect_uri passed in the URI "SIOPv2://"
 * @param response_type the response_type passed in the URI "SIOPv2://"
 * @param scope the scope passed in the URI "SIOPv2://"
 * @param state the state passed in the URI "SIOPv2://"
 * @param nonce the nonce passed in the URI "SIOPv2://"
 * @param credential_offer_uri the credential_offer_uri passed in the URI "credential_offer_uri://"
 */
export interface URIParams {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  scope?: string;
  state?: string;
  nonce?: string;
  credential_offer_uri?: string;
}

export interface RequestBodyVP {
  vp_token: string;
  presentation_submission: string;
}
