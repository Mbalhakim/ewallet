import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import TailwindButton from '../../components/TailwindButton';
import useVpStore from './store';
import { VcIdModel } from '../../util/types/Credential';
import { getData } from '../../util/EncryptedStorage';
import { useAuth } from '../../context/AuthProvider';
import {
  generatePresentationSubmission,
  generateVerifiablePresentation,
  hasIdToken
} from './VpUtils';
import axios from 'axios';
import { useStepperDialogContext } from '../../components/StepperDialog';
import { RequestBody } from '../../util/DataTypes';
import { createAndSignJWT } from '../../util/RequestService';
import { createAndSignJWTForVP } from '../../util/VPService';
import { StorageKeyEnums } from '../../constants/const';

const ConfirmationScreen = () => {
  const { setVisibility, nextStep } = useStepperDialogContext();
  const {
    clientId,
    state,
    nonce,
    selectedVcs,
    presentationDefinition,
    responseUri,
    responseType,
    setSuccess,
    setFailure,
    setErrorMessage
  } = useVpStore();
  const [credentials, setCredentials] = useState<VcIdModel[]>([]);
  const { authData } = useAuth();

  useEffect(() => {
    getData(StorageKeyEnums.CREDENTIALS).then((data) => {
      let credArray = Object.keys(data).map((key) => data[key]);
      setCredentials(credArray.filter((cred) => selectedVcs.includes(cred.id)));
    });
  }, [selectedVcs]);

  const postPresentation = async () => {
    if (presentationDefinition) {
      let submission = generatePresentationSubmission(presentationDefinition);
      let presentation = generateVerifiablePresentation(
        // TODO: Handle multiple vc's
        credentials[0],
        authData!.did
      );

      const headers = { headers: { 'Content-Type': 'application/json' } };
      let body;
      const jwtSubmission: any = await createAndSignJWTForVP(submission);
      const jwtpresentation: any = await createAndSignJWTForVP(presentation);
      if (hasIdToken(responseType)) {
        //TODO: Find a way to make this segment a general function
        // to reduce repeated code.
        // This part is meant for when VP is combined with SIOPv2.
        const userData = await getData(StorageKeyEnums.AUTH_DATA);
        const username = userData.username;
        const did = userData.did;
        //TODO: De JWT die we nu opsturen klopt niet
        const jwtIdToken: any = await createAndSignJWT(clientId, username, did);
        const idToken: RequestBody = {
          id_token: jwtIdToken,
          state: state,
          nonce: nonce
        };
        body = {
          id_token: idToken,
          presentation_submission: jwtSubmission,
          vp_token: jwtpresentation
        };
      } else {
        body = {
          presentation_submission: jwtSubmission,
          vp_token: jwtpresentation
        };
      }
      try {
        let res = await axios.post(responseUri, body, headers);
        setSuccess();
        nextStep();
      } catch (e) {
        setFailure();
        setErrorMessage(`${e}`);
        nextStep();
      }
    } else {
      console.error("No presentation definition, this shouldn't happen");
    }
  };

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
        <View className='flex flex-1 flex-col items-center justify-center gap-2'>
          <Text className='color-slate-800 mb-2 text-center text-lg'>
            Are you sure you want to share the following credentials
          </Text>
          {credentials.map((cred) => (
            <Text
              className='color-slate-800 text-lg font-semibold'
              key={cred.id}
            >
              {cred.credentialSchema.id}
            </Text>
          ))}
        </View>
      </View>
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton
          text='No'
          variant='secondary'
          className='mr-1 flex-1'
          onPress={() => setVisibility(false)}
        />
        <TailwindButton
          text='Yes'
          className='ml-1 flex-1'
          onPress={postPresentation}
        />
      </View>
    </View>
  );
};

export default ConfirmationScreen;
