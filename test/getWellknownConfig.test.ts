import axios from 'axios';
import { getWellknownConfig } from '../util/RequestService';

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

describe('getWellknownConfig', () => {
  const issuer = 'https://issuer.example.com';
  const headers = { headers: { 'Content-Type': 'application/json' } };

  it('should fetch both OIDC and OAuth well-known configs and merge them', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { issuer: 'oidc-data' } })
      .mockResolvedValueOnce({ data: { token_endpoint: 'oauth-data' } });

    const result = await getWellknownConfig(issuer);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      issuer + '/.well-known/openid-credential-issuer',
      headers
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      issuer + '/.well-known/oauth-authorization-server',
      headers
    );
    expect(result).toEqual({
      issuer: 'oidc-data',
      token_endpoint: 'oauth-data'
    });
  });

  it('should return undefined and log error if request fails', async () => {
    console.log = jest.fn();

    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await getWellknownConfig(issuer);

    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
  });
});
