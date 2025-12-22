import * as React from 'react';
import { Text, View } from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CredentialContainer from '../components/CredentialContainer';
import HomeContainer from '../components/HomeContainer';
import TailwindButton from '../components/TailwindButton';
import '../nativewind-env.d.ts';
import { deleteCredential } from '../util/EncryptedStorage';
import { determineTypeUtil } from '../helpers/DetermineTypeUtil';
import Popup from '../components/Popup';

/**
 * This screen is used to display a credential.
 *
 * @returns A screen with a credential component and a button component
 */
const CredentialViewScreen = ({ route }) => {
  const { credential } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const deleteCredentialFromStorage = () => {
    deleteCredential(Object.keys(credential)[0]);
  };

  return (
    <HomeContainer>
      <HomeContainer.Header>
        <View className='flex flex-row items-center gap-1'>
          <Icon name='menu' size={30} />
          <Text className='color-slate-800 font-anton text-xl'>
            View credential
          </Text>
        </View>
        <Icon name='edit' size={30} />
      </HomeContainer.Header>
      <HomeContainer.Body>
        <CredentialContainer credential={credential} />
      </HomeContainer.Body>
      <HomeContainer.Actions>
        <Popup>
          <Popup.Trigger asChild>
            <TailwindButton
              text='Delete VC'
              size='small'
              className='mt-1 bg-red-500'
            />
          </Popup.Trigger>
          <Popup.Body
            acceptText='Yes'
            rejectText='No'
            title='Delete credential'
            bodyText='Are you sure you want to delete this credential, this action cannot be undone'
            onAccept={() => deleteCredentialFromStorage()}
          />
        </Popup>
      </HomeContainer.Actions>
    </HomeContainer>
  );
};

export default CredentialViewScreen;
