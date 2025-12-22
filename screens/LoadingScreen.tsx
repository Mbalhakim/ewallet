import * as React from 'react';
import { Text, View } from 'react-native';

import {
  ParamListBase,
  useNavigation,
  useFocusEffect
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DLStyle } from '../Styles';

/**
 * This screen is used to display a loading message while the app is checking
 * for a credential offer URI or a client ID to determine which screen to
 * navigate to.
 *
 * @returns A screen with a loading message
 */
const LoadingScreen = ({ route }) => {
  const {
    params: {
      client_id,
      redirect_uri,
      response_type,
      scope,
      id_token_type,
      state,
      nonce,
      credential_offer_uri,
      presentation_definition,
      presentation_definition_uri,
      request_uri,
      same_device
    }
  } = route;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  //Navigates to The correct screen as soon an the screen is loaded
  useFocusEffect(
    React.useCallback(() => {
      if (credential_offer_uri && same_device) {
        console.log('Same device');
        navigation.navigate('RequestCredential', {
          credential_offer_uri: credential_offer_uri
        });
      } else if (credential_offer_uri) {
        navigation.navigate('ConsentCredentialURI', {
          credential_offer_uri: credential_offer_uri
        });
      } else if (presentation_definition_uri) {
        navigation.navigate('ConsentVPDefinition', {
          client_id: client_id,
          redirect_uri: redirect_uri,
          response_type: response_type,
          scope: scope,
          id_token_type: id_token_type,
          state: state,
          nonce: nonce,
          presentation_definition_uri: presentation_definition_uri
        });
      } else if (presentation_definition) {
        navigation.navigate('ConsentRequestObject', {
          client_id: client_id,
          redirect_uri: redirect_uri,
          response_type: response_type,
          scope: scope,
          id_token_type: id_token_type,
          state: state,
          nonce: nonce,
          presentation_definition: presentation_definition
        });
      } else if (client_id && !request_uri) {
        navigation.navigate('Consent', {
          client_id: client_id,
          redirect_uri: redirect_uri,
          response_type: response_type,
          scope: scope,
          state: state,
          nonce: nonce
        });
      } else if (client_id && request_uri) {
        navigation.navigate('ConsentRequestObject', {
          request_uri,
          client_id
        });
      } else {
        navigation.navigate('CredentialListScreen');
      }
    }, [])
  );

  return (
    <View style={DLStyle.container}>
      <Text style={DLStyle.h1}>Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
