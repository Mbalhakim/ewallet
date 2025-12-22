import React from 'react';
import { View, Text } from 'react-native';
import TailwindButton from '../../components/TailwindButton';
import { useStepperDialogContext } from '../../components/StepperDialog';
import useVpStore from './store';

const ResultScreen = () => {
  const { setVisibility } = useStepperDialogContext();
  const { status, errorMessage } = useVpStore();

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
        <View className='flex flex-1 flex-col items-center justify-center gap-2'>
          {status == 'success' && (
            <Text className='color-slate-800 mb-2 text-center text-lg'>
              Presentation successful
            </Text>
          )}
          {status == 'failure' && (
            <>
              <Text className='color-red-800 mb-2 text-center text-lg'>
                There was an error presenting your credential
              </Text>
              <Text className='color-slate-800 mt-2 text-center'>
                {errorMessage}
              </Text>
            </>
          )}
        </View>
      </View>
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton
          text='Ok'
          className='mr-1 flex-1'
          onPress={() => setVisibility(false)}
        />
      </View>
    </View>
  );
};

export default ResultScreen;
