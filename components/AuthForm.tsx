import React, { Dispatch, SetStateAction } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import TailwindButton from '../components/TailwindButton';
import HomeContainer from './HomeContainer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBiometrics from 'react-native-biometrics';
import Popup from '../components/Popup';
import { storeData } from '../util/EncryptedStorage';
import * as SolidPod from '../util/SolidPodService';
import log from '../util/ReactLogger';
/**
 * This component is used to display a form for authentication.
 *
 * @param title The title of the form
 * @param username The username of the user
 * @param setUsername The function to set the username
 * @param password The password of the user
 * @param setPassword The function to set the password
 * @param handleLogin The function to handle the login
 */

type AuthProps = {
  title: string;
  username?: string;
  setUsername?: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  handleLogin: () => void;
  showUsername?: boolean;
  showBiometrics?: boolean;
  onBiometricsSucess?: () => Promise<void>;
  showRemoveButton?: boolean;
  onRemoveClick?: () => Promise<void>;
};

const AuthForm = ({
  title,
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  showUsername = true,
  showBiometrics = false,
  onBiometricsSucess,
  showRemoveButton = false,
  onRemoveClick
}: AuthProps) => {
  const rnBiometrics = new ReactNativeBiometrics();
  const biometricClick = () => {
    rnBiometrics
      .simplePrompt({ promptMessage: 'Unlock wallet' })
      .then((resultObject) => {
        const { success } = resultObject;
        if (success) {
          if (onBiometricsSucess) {
            onBiometricsSucess();
          }
        } else {
          return;
        }
      });
  };

  const clearAllData = async () => {
    const keysToClean = [
      'DidKeyPair',
      'AuthData',
      'solid_client_credentials',
      'authorization',
      'solid_access_token',
      'solid_token_expiry',
      'solid_webid',
      'solid_issuer',
      'credentials',
      'biometrics_enabled',
      'user_pin',
      'session_pin',
    ];

    await Promise.all(keysToClean.map((key) => storeData(key, null)));
  };

  const removeClick = async () => {
    try {
      // disconnect from SOLID POD if connected
      await SolidPod.disconnect();

      // Clear all data
      await clearAllData();

      if (onRemoveClick) {
        onRemoveClick();
      }
    } catch (error) {
      log.error('Error during user removal:', error);

      if (onRemoveClick) {
        onRemoveClick();
      }
    }
  };

  return (
    <View className='flex h-full w-full flex-col items-center justify-between'>
      <View className='flex w-full flex-1 items-center justify-center'>
        <View className='flex w-full flex-col justify-center rounded-lg border border-b-ditblue-700 bg-gray-100 px-6 py-6 shadow-md shadow-ditblue-700'>
          {showUsername && (
            <Text className='color-slate-800 text-base'>Username:</Text>
          )}
          {showUsername && (
            <TextInput
              className='mb-4 rounded-lg border border-solid border-b-ditblue-700 bg-white '
              value={username}
              onChangeText={setUsername}
            />
          )}
          <Text className='color-slate-800 text-base'>Password:</Text>
          <TextInput
            className='mb-4 rounded-lg border border-solid border-b-ditblue-700 bg-white'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            keyboardType={'number-pad'}
          />
          <View className='flex flex-row'>
            <TailwindButton
              size='large'
              text={title}
              variant='primary'
              onPress={handleLogin}
              className='flex-1'
            />
            {showBiometrics && (
              <TailwindButton className='ml-1' onPress={biometricClick}>
                <Icon name='fingerprint' color='white' size={30} />
              </TailwindButton>
            )}
          </View>
        </View>
      </View>
      {showRemoveButton && (
        <Popup>
          <Popup.Trigger asChild>
            <TailwindButton className='w-full bg-red-500' text='Remove user' />
          </Popup.Trigger>
          <Popup.Body
            acceptText='Yes'
            rejectText='No'
            title='Delete user'
            bodyText='Are you sure you want to remove your user, this will delete all your credentials and cannot be undone'
            onAccept={removeClick}
          />
        </Popup>
      )}
    </View>
  );
};

export default AuthForm;
