import * as React from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Consent from '../components/Consent';
import {getVPDefinition} from "../util/VPService";

/* Extracts the domain from a url */
function extractDomain(url): string {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}

/**
 * This screen is used to ask the user for consent to obtain a Verifiable Presentation Definition
 *
 * @param route contains the parameters passed from the previous screen
 * @returns a screen with the consent buttons
 */

const ConsentVPDefinition = ({ route }) => {
  const {
    params: {
      response_type,
      client_id,
      redirect_uri,
      scope,
      id_token_type,
      nonce,
      state,
      presentation_definition_uri
    }
  } = route;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // If the user accepts the Verifiable Presentation Definition consent,
  // we request the VP Definition, and then navigate to the selectAuth screen
  const onAccept = async (): Promise<void> => {
    const response = await getVPDefinition(client_id, presentation_definition_uri);
    if (response.status === 200) {
      navigation.navigate('ConsentRequestObject', {
        client_id: client_id,
        redirect_uri: redirect_uri,
        response_type: response_type,
        scope: scope,
        id_token_type: id_token_type,
        state: state,
        nonce: nonce,
        presentation_definition: response.data
      });
    } else {
      console.error('error');
      navigation.navigate('HomeScreen');
    }
  };

  // If the user rejects the consent, we navigate back to the home screen
  const onReject = (): void => {
    navigation.navigate('HomeScreen');
  };

  return (
    <Consent title={extractDomain(client_id)} activity='send you a VP Definition' onAccept={onAccept} onReject={onReject} />
  );
};

export default ConsentVPDefinition;
