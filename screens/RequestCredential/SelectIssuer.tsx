import { View, Text } from 'react-native';
import useStore from './store';
import React, { useEffect, useState } from 'react';
import SelectionBox from '../../components/SelectionBox';
import TailwindButton from '../../components/TailwindButton';
import { useStepperDialogContext } from '../../components/StepperDialog';

const SelectIssuer = () => {
  const {
    selectedType,
    selectedIssuer,
    setSelectedIssuer,
    issuers,
    credentialTypes
  } = useStore();
  const { previousStep, nextStep } = useStepperDialogContext();
  const [supportedIssuers, setSupportedIssuers] = useState<string[]>([]);

  const selectPress = (index: number) => {
    setSelectedIssuer(index);
  };

  useEffect(() => {
    let supported = issuers
      .filter((issuer) =>
        issuer.supportedCredentialTypes.includes(credentialTypes[selectedType])
      )
      .map((issuer) => issuer.name);
    if (supported.length == 1) {
      setSelectedIssuer(
        issuers.findIndex((issuer) =>
          issuer.supportedCredentialTypes.includes(
            credentialTypes[selectedType]
          )
        )
      );
    } else {
      setSelectedIssuer(-1);
    }
    setSupportedIssuers(supported);
  }, [selectedType]);

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
        <View className='flex flex-1 flex-col items-center justify-center gap-2'>
          <Text className='color-slate-800 mb-2 text-center text-lg'>
            Select a credential type
          </Text>
          {supportedIssuers.length > 1 && (
            <SelectionBox
              selections={supportedIssuers}
              onSelectionPress={selectPress}
            />
          )}
          {supportedIssuers.length == 0 && (
            <Text className='color-slate-800 mt-2 text-center font-semibold'>
              There are no issuers that support this credential type
            </Text>
          )}
          {supportedIssuers.length == 1 && (
            <>
              <Text className='color-slate-800 mt-2 text-center'>
                Only one issuer supports this credential type, this issuer will
                be used
              </Text>
              <Text className='color-slate-800 mt-2 text-center text-lg font-semibold'>
                {issuers[selectedIssuer].name}
              </Text>
            </>
          )}
        </View>
      </View>
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton
          text='Previous'
          variant='secondary'
          className='mr-1 flex-1'
          onPress={() => previousStep()}
        />
        <TailwindButton
          text='Next'
          className='ml-1 flex-1'
          onPress={() => nextStep()}
        />
      </View>
    </View>
  );
};

export default SelectIssuer;
