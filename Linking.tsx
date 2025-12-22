/**
 * This file is used to configure the deep linking for the app.
 * @see https://reactnavigation.org/docs/deep-linking/
 */

const config = {
  screens: {
    LoadingScreen: {
      path: '',
      parse: {
        client_id: (client_id: string) => `${client_id}`,
        redirect_uri: (redirect_uri: string) => `${redirect_uri}`,
        response_type: (response_type: string) => `${response_type}`,
        scope: (scope: string) => `${scope}`,
        state: (state: string) => `${state}`,
        nonce: (nonce: string) => `${nonce}`,
        credential_offer_uri: (credential_offer_uri: string) =>
          `${credential_offer_uri}`
      }
    }
  }
};

const Linking = {
  prefixes: ['app://ditlabwallet7', 'siopv2://', 'openid-credential-offer://', '/authorize'],
  config
};

export default Linking;
