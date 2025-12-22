import * as React from 'react';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postVP } from '../util/VPService';
import Consent from '../components/Consent';

/* Extracts the domain from a url */
export function extractDomain(url): string {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}

/**
 * This screen is used to ask the user for consent to start the Authorization flow
 *
 * @param route contains the parameters passed from the previous screen
 * @returns a screen
 *
 * Documentation:
 *
 * A VP Token is only returned if the corresponding Authorization Request contained a presentation_definition parameter,
 * a presentation_definition_uri parameter, or a scope parameter representing a Presentation Definition Section 5.
 *
 *     VP Token can be returned in the Authorization Response or the Token Response depending on the Response Type used.
 *     See Section 5.4 for more details.
 *
 *     If the Response Type value is vp_token, the VP Token is returned in the Authorization Response. When the Response
 *     Type value is vp_token id_token and the scope parameter contains openid, the VP Token is returned in the
 *     Authorization Response alongside a Self-Issued ID Token as defined in [SIOPv2].
 *
 *     Voorbeeld:
 *
 * response_type=${data.response_type}
 * &client_id=${data.client_id}
 * &redirect_uri=${data.redirect_uri}
 * &scope=${data.scope}
 * &id_token_type=${data.id_token_type}
 * &nonce=${data.nonce}
 * &state=${data.state}
 * &presentation_definition=${data.presentation_definition}
 * &presentation_definition_uri=${data.presentation_definition_uri}`;
 */

const ConsentAuthorization = ({ route }) => {
  //TODO bekijk interactie met meerdere VPs voor uni Bologna
  const {
    params: {
      response_type,
      client_id,
      redirect_uri,
      scope,
      id_token_type,
      nonce,
      state,
      presentation_definition
    }
  } = route;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // If the user accepts the authorization consent, we navigate to the selectAuth screen
  const onAccept = async (): Promise<void> => {
    const response = await postVP(client_id, redirect_uri);
    if (response.status === 201) {
      navigation.navigate('SelectAuthorizationScreen', {
        message: 'Succesfully shared vp'
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
    <Consent
      title={extractDomain(client_id)}
      activity='receive a credential'
      onAccept={onAccept}
      onReject={onReject}
    />
  );
};

export default ConsentAuthorization;
