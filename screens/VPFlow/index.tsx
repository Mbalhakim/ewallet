import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import StepperDialog, {
  useStepperDialogContext
} from '../../components/StepperDialog';
import ConsentScreen from './ConsentScreen';
import SelectVcScreen from './SelectVcScreen';
import ConfirmationScreen from './ConfirmationScreen';
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import useVpStore from './store';
import TailwindButton from '../../components/TailwindButton';
import ResultScreen from './ResultScreen';
import { localhostConverter } from '../../util/LocalhostConverter';

const VpDialog = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(true);
  const route = useRoute();
  const vpStore = useVpStore();
  const {
    params: {
      response_type,
      client_id,
      request_uri,
      redirect_uri,
      scope,
      id_token_type,
      nonce,
      state,
      presentation_definition
    }
  } = route;

  useFocusEffect(() => {
    vpStore.setClientId(client_id);
    if (presentation_definition) {
      vpStore.setPresentationDefinition(presentation_definition);
      const rederictUri = localhostConverter(client_id, redirect_uri);
      vpStore.setResponseUri(rederictUri);
    } else {
      const requestUri = localhostConverter(client_id, request_uri);
      vpStore.setRequestUri(requestUri);
    }
    if (response_type) {
      vpStore.setResponseType(response_type);
      vpStore.setNonce(nonce);
      vpStore.setState(state);
    }
  });

  useEffect(() => {
    if (visible === false) {
      navigation.navigate('HomeScreen');
    }
  }, [visible]);

  useFocusEffect(() => {
    setVisible(true);
  });

  return (
    <StepperDialog
      visible={visible}
      steps={[
        { title: 'Consent', showInHeader: true },
        { title: 'Share VCs', showInHeader: true },
        { title: 'Success', showInHeader: true },
        { showInHeader: false }
      ]}
      setVisibility={(state) => {
        setVisible(state);
      }}
    >
      <StepperDialog.Steps>
        <StepperDialog.Step step={0} component={<ConsentScreen />} />
        <StepperDialog.Step step={1} component={<SelectVcScreen />} />
        <StepperDialog.Step step={2} component={<ConfirmationScreen />} />
        <StepperDialog.Step step={3} component={<ResultScreen />} noHeader />
      </StepperDialog.Steps>
    </StepperDialog>
  );
};

const Step = ({ text }: { text: string }) => {
  const { nextStep, previousStep } = useStepperDialogContext();
  return (
    <View className='flex flex-1 flex-col px-4 py-2'>
      <View className='flex-1'>
        <Text className='text-lg'>{text}</Text>
      </View>
      <View className='flex flex-row items-center justify-between gap-1'>
        <TailwindButton text='Previous step' onPress={previousStep} />
        <TailwindButton text='Next step' onPress={nextStep} />
      </View>
    </View>
  );
};

export default VpDialog;
