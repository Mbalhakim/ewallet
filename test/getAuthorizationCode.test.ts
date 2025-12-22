import axios from 'axios';
import { getAuthorizationCode } from '../util/RequestService';

jest.mock('axios');
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getAuthorizationCode', () => {
  const state = 'mock-state';
  const tokenEndpoint = 'https://issuer.example.com/token';
  const credential_issuer = 'https://issuer.example.com';

  it('should post to token endpoint and return response data', async () => {
    const expectedResponse = { access_token: 'abc123', token_type: 'Bearer' };
    mockedAxios.post.mockResolvedValueOnce({ data: expectedResponse });

    const result = await getAuthorizationCode(
      state,
      tokenEndpoint,
      credential_issuer
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(tokenEndpoint, {
      grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
      'pre-authorized_code': state
    });
    expect(result).toEqual(expectedResponse);
  });

  it('should throw error if axios post fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Post failed'));
    await expect(
      getAuthorizationCode(state, tokenEndpoint, credential_issuer)
    ).rejects.toThrow('Post failed');
  });
});
