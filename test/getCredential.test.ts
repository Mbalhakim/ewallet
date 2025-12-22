import axios from 'axios';
import { getCredential } from '../util/RequestService';
import { generateJWT } from '../util/JWTService';
import log from '../util/ReactLogger';

jest.mock('axios');
jest.mock('../util/JWTService');
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));
jest.mock('../util/ReactLogger', () => ({
  debug: jest.fn(),
  error: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGenerateJWT = generateJWT as jest.Mock;

describe('getCredential', () => {
  const credential_endpoint = 'https://example.com/credential';
  const access_token = 'testAccessToken';
  const credential_issuer = 'https://issuer.com';
  const credentialType = 'TestCredentialType';
  const c_nonce = 'testNonce';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully post to credential endpoint and return data', async () => {
    // Mock generateJWT to return a fake JWT string
    mockedGenerateJWT.mockResolvedValue('mocked.jwt.token');

    // Mock axios.post to return a successful response
    const mockResponse = { data: { credential: 'mockCredentialData' } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await getCredential(
      credential_endpoint,
      access_token,
      credential_issuer,
      credentialType,
      c_nonce
    );

    // Check that generateJWT was called with correct arguments
    expect(mockedGenerateJWT).toHaveBeenCalledWith(credential_issuer, c_nonce);

    // Check axios.post call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(credential_endpoint),
      expect.objectContaining({
        format: 'jwt_vc_json',
        credential_definition: {
          type: [credentialType],
          credentialSubject: {}
        },
        proof: {
          proof_type: 'jwt',
          jwt: 'mocked.jwt.token'
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    // Check that result matches mockResponse.data
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle axios post error gracefully', async () => {
    mockedGenerateJWT.mockResolvedValue('mocked.jwt.token');

    // Mock axios.post to reject with error object with response property
    const errorResponse = {
      response: {
        status: 400,
        data: { error: 'Bad Request' }
      },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(errorResponse);

    const result = await getCredential(
      credential_endpoint,
      access_token,
      credential_issuer,
      credentialType,
      c_nonce
    );

    // Check that result is undefined
    expect(result).toBeUndefined();

    // Verify that log.error and log.debug were called
    expect(log.debug).toHaveBeenCalledWith(
      'Error response:',
      errorResponse.response
    );
    expect(log.error).toHaveBeenCalledWith(
      'Server responded with:',
      errorResponse.response.status,
      errorResponse.response.data
    );
  });
});
