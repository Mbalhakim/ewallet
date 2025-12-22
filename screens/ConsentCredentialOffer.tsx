import React from 'react';
import { Text, View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/routers';

import ConsentButtons from '../components/ConsentButtons';
import { decodeJWT } from '../util/JWTService';
import {
  getAuthorizationCode,
  getWellknownConfig,
  getCredential
} from '../util/RequestService';
import { storeCredential } from '../util/EncryptedStorage';
import { VcIdModel } from '../util/types/Credential';
import { useAuth } from '../context/AuthProvider';
import { useNavBar } from '../context/NavProvider';
import '../nativewind-env.d.ts';
import Consent from '../components/Consent.tsx';
import { useNavigation } from '@react-navigation/native';
import {
  fetchCredential,
  getCredentialOffer as utilGetCredentialOffer
} from '../util/ReceiveCredential.ts';
import { extractDomain } from './ConsentAuthorization.tsx';

/**
 * This screen is displayed when the user proceeds with the credential offer.
 * The user is presented with the option to accept or reject the credential offer.
 * If the user accepts, the user retrieves the credential from the credential endpoint.
 *
 * @param route | credential_offer_uri is passed in as a route parameter
 * @returns A screen with the credential offer URI and accept/reject buttons
 */
const ConsentCredentialOffer = ({ route }) => {
  const {
    params: { credential_offer_uri }
  } = route;
  const [credentialIssuer, setCredentialIssuer] = React.useState('');
  const [credentialType, setCredentialType] = React.useState('');
  const [issuerState, setIssuerState] = React.useState('');
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { setNavBarShown } = useNavBar();

  React.useEffect(() => {
    if (credential_offer_uri) {
      getCredentialOffer();
    }
  }, []);

  /**
   * This function retrieves the credential offer from the credential offer URI.
   * The credential offer contains the credential issuer, the credential, and the issuer state.
   *
   * @returns Promise<void>
   */
  const getCredentialOffer = async (): Promise<void> => {
    utilGetCredentialOffer(credential_offer_uri).then((data) => {
      setCredentialIssuer(data.credential_issuer);
      // if (data.grants.authorization_code) {
      //   setIssuerState(data.grants.authorization_code.issuer_state);
      //   setCredential(data.credentials[0]);
      //   log.info('issuer_state:', data.grants.authorization_code.issuer_state);
      // }
      setCredentialType(data.credential_configuration_ids[0]);
      setIssuerState(data.grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"]["pre-authorized_code"]);
    });
  };

  // If the user accepts the credential offer, we first retrieve the
  // well-known config from the credential issuer. Then we retrieve the
  // authorization code from the authorization server. Finally, we retrieve
  // the credential from the credential endpoint.
  // Afterward, we decode the credential JWT and store it in the encrypted storage.
  const onAccept = async () => {
    try {
      fetchCredential(credentialIssuer, issuerState, credentialType).then(() => {
        navigation.navigate('CredentialViewScreen', { credentialType });
        setNavBarShown(true);
      });
    } catch (error) {
      console.log(error);
    }
  };

  // If the user rejects the retrival, we navigate back to the home screen.
  const onReject = () => {
    navigation.navigate('HomeScreen');
  };

  let domain = '';
  if (credentialIssuer) {
    domain = extractDomain(credentialIssuer);
  }

  return (
    <Consent
      title={domain}
      activity='provide a credential'
      onAccept={onAccept}
      onReject={onReject}
    />
  );
};

export default ConsentCredentialOffer;
