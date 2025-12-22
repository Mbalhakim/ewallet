import React from 'react';
import { Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/routers';

import ConsentButtons from '../components/ConsentButtons';
import '../nativewind-env.d.ts';
import Consent from '../components/Consent.tsx';
import { extractDomain } from './ConsentAuthorization.tsx';

/**
 * This screen is displayed when a link is opened that contains a credential offer URI.
 * The user is presented with the option to accept or reject the credential offer.
 * If the user accepts, the app navigates to the ConsentCredentialOffer screen.
 *
 * @param route | credential_offer_uri is passed in as a route parameter
 * @returns A screen with the credential offer URI and accept/reject buttons
 */
const ConsentCredentialURI = ({ route }) => {
  const {
    params: { credential_offer_uri }
  } = route;

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // If the user accepts the credential offer, we navigate to the ConsentCredentialOffer screen
  const onAccept = (): void => {
    navigation.navigate('ConsentCredentialOffer', {
      credential_offer_uri: credential_offer_uri
    });
  };

  // If the user rejects the credential offer, we navigate to the Home screen
  const onReject = (): void => {
    navigation.navigate('HomeScreen');
  };

  const domain = extractDomain(credential_offer_uri);

  return (
    <Consent title={domain} activity='provide a credential' onAccept={onAccept} onReject={onReject} />
  );
};

export default ConsentCredentialURI;
