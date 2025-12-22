import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import Banner from '../components/Banner';

import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

const Stack = createNativeStackNavigator();

/**
 * This stack navigator is used to display the login and registration screens.
 * @returns A stack navigator with the login and registration screens
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName='RegistrationScreen'
      screenOptions={{
        headerTitle: () => <Banner />,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackVisible: false
      }}
    >
      <Stack.Screen name='LoginScreen' component={LoginScreen} />
      <Stack.Screen name='RegistrationScreen' component={RegistrationScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
