import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import useVpStore from './store';
import { SavedCredentials, VcIdModel } from '../../util/types/Credential';
import jsonpath from 'jsonpath';
import { getData } from '../../util/EncryptedStorage';
import { View } from 'react-native';
import '../../nativewind-env.d.ts';
import TailwindButton from '../../components/TailwindButton';
import { styled } from 'nativewind';
import { useStepperDialogContext } from '../../components/StepperDialog.tsx';
import { twMerge } from 'tailwind-merge';
import CollapsableContainer from '../../components/CollapsableContainer.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { StorageKeyEnums } from '../../constants/const.ts';

const SelectVcScreen = () => {
  const { presentationDefinition, selectedVcs, toggleSelected } = useVpStore();
  const [credentialsArray, setCredentialsArray] = useState<VcIdModel[]>([]);
  const [filteredCredentialsArray, setFilteredCredentialsArray] = useState<
    VcIdModel[]
  >([]);
  const { setVisibility, nextStep } = useStepperDialogContext();

  useEffect(() => {
    getData(StorageKeyEnums.CREDENTIALS).then((data) => {
      setCredentialsArray(Object.keys(data).map((key) => data[key]));
    });
  }, []);
  useEffect(() => {
    setFilteredCredentialsArray([]);
    const inputDescriptor = presentationDefinition?.input_descriptors[0];
    let filteredArray = credentialsArray.filter((credential) => {
      let filtered = false;
      inputDescriptor?.constraints.fields.forEach((constraintField) => {
        const value = jsonpath.value(credential, constraintField.path[0]);
        const pattern = constraintField.filter?.pattern;
        const re = new RegExp(pattern ?? '.');

        // When checking an array, only one of the values has to match
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === constraintField.filter?.type) {
              // No need to go through the rest of the array from here
              filtered = re.test(item);
            }
          });
          return;
        } else {
          if (typeof value == constraintField.filter?.type) {
            filtered = re.test(value);
          }
        }

        // If this value doesn't match there is no need to check the rest of the filters
        if (!filtered) {
          return;
        }
      });
      return filtered;
    });
    if (filteredArray.length === 1) {
      toggleSelected(filteredArray[0].id);
    }
    setFilteredCredentialsArray(filteredArray);
  }, [presentationDefinition, credentialsArray]);

  const renderSwitch = (credArray: VcIdModel[]) => {
    if (credArray.length === 1) {
      return (
        <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
          <View className='flex flex-1 flex-col items-center justify-center gap-2'>
            <Text className='color-slate-800 text-center text-lg'>
              Only one credential with this type found
            </Text>
            <Text className='color-slate-800 mb-2'>
              Do you want to share this credential
            </Text>
            <TailwindButton
              size='large'
              variant='secondary'
              className='px-6 py-3'
            >
              <Text>{credArray[0].credentialSchema.id}</Text>
            </TailwindButton>
          </View>
        </View>
      );
    } else if (credArray.length > 1) {
      return (
        <View className='flex flex-col items-center py-3'>
          <Text className='color-slate-800 mb-6 text-xl font-semibold'>
            Select vc to share
          </Text>
          <View className='flex w-full flex-col items-center px-4 py-2'>
            {filteredCredentialsArray.map((cred) => (
              <TailwindButton
                key={cred.id}
                className='mb-2 w-full'
                variant={
                  selectedVcs.includes(cred.id) ? 'secondary' : 'primary'
                }
                onPress={() => toggleSelected(cred.id)}
              >
                <View className='flex w-full flex-col'>
                  <View className='flex flex-row items-center justify-center'>
                    {selectedVcs.includes(cred.id) && (
                      <Icon name='checkmark-sharp' size={20} color='#0F4274' />
                    )}
                    <Text
                      className={twMerge(
                        'text-center text-lg',
                        selectedVcs.includes(cred.id)
                          ? 'color-ditblue-500'
                          : 'color-white'
                      )}
                    >
                      {cred.credentialSchema.id}
                    </Text>
                  </View>
                  <CollapsableContainer
                    expanded={selectedVcs.includes(cred.id)}
                  >
                    <View className='flex flex-col gap-1'>
                      <Text className='mb-1 text-xl text-ditblue-500 underline'>
                        Information
                      </Text>
                      <Text className='text-ditblue-700'>
                        Issuer: {cred.issuer}
                      </Text>
                      <Text className='text-ditblue-700'>
                        Valid from: {cred.validFrom}
                      </Text>
                      <Text className='text-ditblue-700'>
                        Issued: {cred.issued}
                      </Text>
                    </View>
                  </CollapsableContainer>
                </View>
              </TailwindButton>
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View className='flex flex-1 flex-col items-center justify-start rounded-md bg-gray-300 p-4'>
          <Text>No suitable credentials found</Text>
        </View>
      );
    }
  };

  return (
    <View className='flex flex-1 flex-col justify-between gap-2'>
      {renderSwitch(filteredCredentialsArray)}
      <View className='mt-2 flex flex-row justify-center'>
        <TailwindButton text='No' variant='secondary' className='mr-1 flex-1' />
        <TailwindButton
          text='Yes'
          className={twMerge(
            'ml-1 flex-1',
            selectedVcs.length == 0 && 'bg-gray-600'
          )}
          disabled={selectedVcs.length == 0}
          onPress={() => nextStep()}
        />
      </View>
    </View>
  );
};

export default SelectVcScreen;
