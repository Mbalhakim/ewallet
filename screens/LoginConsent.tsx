import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Color, Padding } from '../GlobalStyles.ts';

import ConsentButtons from '../components/ConsentButtons.tsx';

import { postSiopWrapper } from '../util/RequestService.ts';
import { AxiosResponse } from 'axios';

import { useNavBar } from '../context/NavProvider.tsx';
import Consent from '../components/Consent.tsx';

/* Extracts the domain from a url */
function extractDomain(url): string {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}

/**
 * This screen is used to ask the user for consent to start the SIOPv2 login flow
 *
 * @param route contains the parameters passed from the previous screen
 * @returns a screen with the consent buttons
 */
const LoginConsent = ({ route }) => {
  const {
    params: { client_id, redirect_uri, response_type, scope, state, nonce }
  } = route;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { navBarShown, setNavBarShown } = useNavBar();

  React.useEffect(() => {
    setNavBarShown(false);
  }, []);

  // If the user accepts the consent, we navigate to the Done screen
  async function onAccept(): Promise<void> {
    const response: AxiosResponse = await postSiopWrapper(
      client_id,
      redirect_uri,
      state,
      nonce
    );
    setNavBarShown(true);
    if (response.status === 201) {
      navigation.navigate('DoneScreen', {
        message: 'You have successfully logged in!'
      });
    } else {
      console.error('error');
      navigation.navigate('HomeScreen');
    }
  }

  // If the user rejects the consent, we navigate back to the home screen
  const onReject = (): void => {
    navigation.navigate('HomeScreen');
  };

  return (
    <Consent title={extractDomain(client_id)} activity='receive a verifiable presentation' onAccept={onAccept} onReject={onReject} />
  );
};

export default LoginConsent;
