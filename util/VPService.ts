import axios from 'axios';

import { RequestBodyVP } from './DataTypes';
import { PresentationSubmission } from './types/PresentationSubmission';
import { localhostConverter } from './LocalhostConverter';

const vp_token = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiablePresentation'],
  verifiableCredential: [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: 'https://example.com/credentials/1872',
      type: ['VerifiableCredential', 'IDCardCredential'],
      issuer: {
        id: 'did:example:issuer'
      },
      issuanceDate: '2010-01-01T19:23:24Z',
      credentialSubject: {
        given_name: 'Fredrik',
        family_name: 'Strömberg',
        birthdate: '1949-01-22'
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-03-19T15:30:15Z',
        jws: 'eyJhb...JQdBw',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:example:issuer#keys-1'
      }
    }
  ],
  id: 'ebc6f1c2',
  holder: 'did:example:holder',
  proof: {
    type: 'Ed25519Signature2018',
    created: '2021-03-19T15:30:15Z',
    challenge: 'n-0S6_WzA2Mj',
    domain: 'https://client.example.org/cb',
    jws: 'eyJhbG...IAoDA',
    proofPurpose: 'authentication',
    verificationMethod: 'did:example:holder#key-1'
  }
};

const presentation_submission = {
  id: 'Presentation example 1',
  definition_id: 'Example with selective disclosure',
  descriptor_map: [
    {
      id: 'ID card with constraints',
      format: 'ldp_vp',
      path: '$',
      path_nested: {
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]'
      }
    }
  ]
};

/**
 *
 * @param client_id the client_id passed in the URI
 * @param redirect_uri the redirect_uri passed in the URI
 * @returns the response from the server
 *
 * Documentation example:
 *
 * HTTP/1.1 302 Found
 *   Location: https://client.example.org/cb#
 *     presentation_submission=...
 *     &vp_token=...
 *
 */
const postVP = async (
  client_id: string,
  redirect_uri: string
): Promise<object> => {
  const vptoken = JSON.stringify(vp_token);
  const psub = JSON.stringify(presentation_submission);

  const body: RequestBodyVP = {
    vp_token: vptoken,
    presentation_submission: psub
  };
  if (client_id.includes('localhost')) {
    redirect_uri = redirect_uri.replace('localhost', '10.0.2.2');
  }

  const headers = { headers: { 'Content-Type': 'application/json' } };
  const response = await axios.post(redirect_uri, body, headers);
  return response;
};

/**
 *
 * @param client_id the client_id passed in the URI
 * @param presentation_definition_uri the presentation definition that's being requested
 * @returns the response from the server
 *
 */
const getVPDefinition = async (
  client_id: string,
  presentation_definition_uri: string
): Promise<any> => {
  presentation_definition_uri = localhostConverter(
    client_id,
    presentation_definition_uri
  );
  const response = await axios.get(presentation_definition_uri);
  return response;
};

/**
 *
 * @param presentation_submission the presentation submission that's being made into JWT
 * @returns the signed JWT
 *
 */
const createAndSignJWTForVP = async (
  vpTokenOrSubmission: any
): Promise<string | undefined> => {
  const jwt_content = createJWT(vpTokenOrSubmission);
  const headers = { headers: { 'Content-Type': 'application/json' } };
  try {
    const res = axios.post(
      'https://wallet-extension.ditlab.cloud/jwt/sign',
      jwt_content,
      headers
    );
    return (await res).data;
  } catch (error) {
    console.log(error.response.data);
  }
};

/**
 *
 * @param vpTokenOrSubmission Either the VP Token or the VP Submission. Since both get sent as their object whole,
 * either can be accepted.
 * @returns the signed JWT for either the VP Token or the VP Submission.
 *
 */
function createJWT(vpTokenOrSubmission: any): {
  payload: object;
  signingAlgorithm: string;
} {
  return {
    payload: vpTokenOrSubmission,
    signingAlgorithm: 'PS256'
  };
}

export { postVP, getVPDefinition, createAndSignJWTForVP };
