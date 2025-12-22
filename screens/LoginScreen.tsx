import * as React from 'react';
import { View } from 'react-native';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthProvider';
import { StorageKeyEnums } from '../constants/const';
import '../nativewind-env.d.ts';
import { getData, storeData } from '../util/EncryptedStorage';
import { Authdata } from '../util/DataTypes';
import { useNavigation } from '@react-navigation/native';
import RNRestart from 'react-native-restart';
import { SavedCredentials } from '../util/types/Credential';

const LoginScreen = () => {
  const { authData, setAuthData, setIsLoggedIn } = useAuth();
  const [password, setPassword] = React.useState<string>('');
  const navigation = useNavigation();
  const handleLogin = async () => {
    let data = await getData(StorageKeyEnums.AUTH_DATA);
    if (password === data.password) {
      login();
    } else {
      alert('Incorrect password');
    }
  };

  const login = async () => {
    let data = await getData(StorageKeyEnums.AUTH_DATA);
    setAuthData({ ...data, isLoggedIn: true });
    setIsLoggedIn(true);
  };

  const removeClick = async () => {
    await storeData(StorageKeyEnums.AUTH_DATA, {} as Authdata);
    await storeData(StorageKeyEnums.CREDENTIALS, {} as SavedCredentials);
    RNRestart.restart();
  };

  return (
    <View className='flex h-full items-center justify-center bg-gray-50 p-8'>
      <AuthForm
        title='Unlock'
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        showUsername={false}
        showBiometrics
        onBiometricsSucess={login}
        showRemoveButton
        onRemoveClick={removeClick}
      />
    </View>
  );
};

export default LoginScreen;
