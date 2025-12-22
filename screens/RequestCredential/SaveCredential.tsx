import React, { useEffect, useState } from 'react';
import { View, Text, DevToolsSettingsManager } from 'react-native';
import { useStepperDialogContext } from '../../components/StepperDialog';
import {
  fetchCredential,
  getCredentialOffer
} from '../../util/ReceiveCredential';
import { VcIdModel } from '../../util/types/Credential';
import TailwindButton from '../../components/TailwindButton';
import { useNavigation } from '@react-navigation/native';
import { useNavBar } from '../../context/NavProvider';

type Props = {
  offerUri: string;
};

const SaveCredential = ({ offerUri }: Props) => {
  const [credentialIssuer, setCredentialIssuer] = useState('');
  const [issuerState, setIssuerState] = useState('');
  const [credential, setCredential] = useState<any>({});
  const navigation = useNavigation();
  const { setNavBarShown } = useNavBar();

  const getOffer = async () => {
    getCredentialOffer(offerUri).then((data) => {
      setCredentialIssuer(data.credential_issuer);
      setIssuerState(data.grants.authorization_code.issuer_state);
      setCredential(data.credentials[0]);
    });
  };

  const onAccept = async () => {
    try {
      fetchCredential(credentialIssuer, issuerState).then(() => {
        navigation.navigate('CredentialListScreen');
        setNavBarShown(true);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onReject = async () => {
    navigation.navigate('HomeScreen');
    setNavBarShown(true);
  };

  useEffect(() => {
    getOffer();
  }, []);

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      <View className='flex flex-1 flex-col items-center justify-center gap-2'>
        <Text className='color-slate-800 mt-2 text-center text-lg font-bold'>
          Do you want to receive the following credential from{' '}
          {credentialIssuer}
        </Text>
        {'types' in credential && (
          <Text className='color-ditblue-500 text-xl font-semibold'>
            {credential.types[0]}
          </Text>
        )}
      </View>
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton
          text='No'
          variant='secondary'
          className='mr-1 flex-1'
          onPress={onReject}
        />
        <TailwindButton text='Yes' className='ml-1 flex-1' onPress={onAccept} />
      </View>
    </View>
  );
};

export default SaveCredential;
