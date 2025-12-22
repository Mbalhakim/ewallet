import axios from 'axios';

export interface SiopDto {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  nonce: string;
  state: string;
}

export async function getSiopQr(baseUrl: string) {
  try {
    const res = await axios.get<SiopDto>(
      baseUrl + '/api/authentication/siop/qr'
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAuthenticated(baseUrl: string, state: string) {
  return axios.get(`${baseUrl}/api/authentication/${state}/is_authenticated`);
}
