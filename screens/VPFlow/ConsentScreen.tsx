import * as React from 'react';
import { useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import '../../nativewind-env.d.ts';
import ConsentButtons from '../../components/ConsentButtons';
import '../../nativewind-env.d.ts';
import { PresentationDefinition } from '../../util/types/PresentationDefinition';
import axios from 'axios';
import useVpStore from './store';
import { useStepperDialogContext } from '../../components/StepperDialog';
import Consent from '../../components/Consent';
import {localhostConverter} from "../../util/LocalhostConverter";

const ConsentScreen = () => {
  const store = useVpStore();
  const { nextStep, previousStep } = useStepperDialogContext();

  const extractDomain = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  };

  const onAccept = async () => {
    if (store.requestUri !== '') {
      const headers = { headers: { 'Content-Type': 'application/json' } };
      console.error(store.requestUri === '');
      const requestObject = await axios
        .get(store.requestUri, headers)
        .catch((e) => console.error(e));
      const presentationDefinition: PresentationDefinition =
        requestObject?.data?.presentation_definition;
      store.setPresentationDefinition(presentationDefinition);
      const responseUri = localhostConverter(store.clientId, requestObject?.data?.response_uri);
      store.setResponseUri(responseUri);
    }
    nextStep();
  };
  const onReject = () => {};

  return (
    <Consent
      title={store.clientId && extractDomain(store.clientId)}
      activity='receive a Verifiable Presentation'
      onAccept={onAccept}
      onReject={onReject}
    />
  );
};

export default ConsentScreen;
