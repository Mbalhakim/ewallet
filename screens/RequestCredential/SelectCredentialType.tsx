import React from 'react';
import { View, Text, Pressable } from 'react-native';
import TailwindButton from '../../components/TailwindButton';
import { useStepperDialogContext } from '../../components/StepperDialog';
import useStore from './store';
import { twMerge } from 'tailwind-merge';
import SelectionBox from '../../components/SelectionBox';

const SelectCredentialType = () => {
  const { nextStep, setVisibility } = useStepperDialogContext();
  const { credentialTypes, setSelectedType, selectedType } = useStore();

  const selectPress = (index: number) => {
    setSelectedType(index);
  };

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
        <View className='flex flex-1 flex-col items-center justify-center gap-2'>
          <Text className='color-slate-800 mb-2 text-center text-lg'>
            Select a credential type
          </Text>
          <SelectionBox
            selections={credentialTypes}
            onSelectionPress={setSelectedType}
          />
        </View>
      </View>
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton
          text='Cancel'
          variant='secondary'
          className='mr-1 flex-1'
          onPress={() => setVisibility(false)}
        />
        <TailwindButton
          text='Next'
          className='ml-1 flex-1'
          onPress={nextStep}
        />
      </View>
    </View>
  );
};

export default SelectCredentialType;
