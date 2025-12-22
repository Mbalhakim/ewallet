import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TextInput,
  NativeModules
} from 'react-native';

import { Border, Color, FontFamily, FontSize, Padding } from '../GlobalStyles';

import AuthForm from '../components/AuthForm';
import { storeData } from '../util/EncryptedStorage';
import { Authdata } from '../util/DataTypes';
import { stringLengthCheck } from '../util/Validation';
import { generateDidWithKeys } from '../util/DIDGenerator';
import { useAuth } from '../context/AuthProvider';
import { DLStyle } from '../Styles';
import { useNavBar } from '../context/NavProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StorageKeyEnums } from '../constants/const';
/**
 * This screen is used to register a new user to the app.
 *
 * @returns A screen with a registration form
 */
const RegistrationScreen = () => {
  const { setIsLoggedIn, userRegistered, checkUserRegistered } = useAuth();
  const { setNavBarShown } = useNavBar();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { SigningModule } = NativeModules;
  const navigation = useNavigation();

  // Hide navbar
  useFocusEffect(() => {
    setNavBarShown(false);
    checkUserRegistered();
    if (userRegistered) {
      navigation.navigate('LoginScreen');
    }
  });
  // Function to handle the registration
  const handleRegister = (): void => {
    // Check if the username and password are long enough
    if (!stringLengthCheck(username)) {
      alert('Username must be longer than 6 characters');
      return;
    }
    if (!stringLengthCheck(password)) {
      alert('Password must be longer than 6 characters');
      return;
    }
    const didWithKeys = generateDidWithKeys();

    const authData: Authdata = {
      username: username,
      password: password,
      isLoggedIn: true,
      did: didWithKeys.did
    };
    storeData(StorageKeyEnums.AUTH_DATA, authData);

    function stringToBytes(input: string): number[] {
      return Array.from(input).map((char) => char.charCodeAt(0));
    }

    storeData(StorageKeyEnums.DID_KEY_PAIR, {
      publicKey: stringToBytes(didWithKeys.publicKey),
      privateKey: stringToBytes(didWithKeys.privateKey)
    });

    SigningModule.createSigningKeys(username, 'RS256');
    setIsLoggedIn(true);
    setNavBarShown(true);
  };

  return (
    <View className='flex h-full items-center justify-center bg-gray-50 p-8'>
      <AuthForm
        title='Register'
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleRegister}
      />
    </View>
  );
};

export default RegistrationScreen;
