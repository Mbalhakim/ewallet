import React, { useEffect } from 'react';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import useStore from './store';
import { getSiopQr } from './utils';
import { Linking, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { postSiopWrapper } from '../../util/RequestService';
import { useStepperDialogContext } from '../../components/StepperDialog';
import TailwindButton from '../../components/TailwindButton';

type Props = {
  offerUri: string | undefined;
};

const Browser = ({ offerUri }: Props) => {
  const { selectedType, issuers, sessionId, setSessionId } = useStore();
  const { nextStep, previousStep, setVisibility } = useStepperDialogContext();

  const openLink = async (session: string) => {
    const url = issuers[selectedType].requestUrl + `/${session}`;
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        readerMode: false,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        showTitle: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: true
      });
    } else Linking.openURL(url);
  };

  const handleAuth = async () => {
    const baseUrl = issuers[selectedType].baseUrl;
    // Instead of scanning the qr code, just fetch it and post authentication manually
    // TODO: The session is necessary because of some technical debt.
    // I'm pretty sure that the session id is tied to some form of possesion
    // proof of the credential. But not sure what this is needed/used for
    const qr = await getSiopQr(baseUrl);
    if (qr) {
      await postSiopWrapper(qr.client_id, qr.redirect_uri, qr.state, qr.nonce);
    }
    return qr;
  };
  useFocusEffect(() => {
    if (!offerUri) {
      handleAuth().then((qr) => {
        if (qr) {
          openLink(qr?.state);
        }
      });
    }
  });

  useEffect(() => {
    if (offerUri) {
      nextStep();
    }
  }, [offerUri]);

  return <Text>You will now be redirected to the issuer</Text>;
};

export default Browser;
