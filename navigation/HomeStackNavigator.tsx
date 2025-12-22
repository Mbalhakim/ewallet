import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import CredentialListScreen from '../screens/CredentialListScreen';
import CredentialViewScreen from '../screens/CredentialViewScreen';
import RequestVC from '../screens/RequestVC';
import LoginConsent from '../screens/LoginConsent';
import Banner from '../components/Banner';
import ScanScreen from '../screens/ScanScreen';
import DoneScreen from '../screens/DoneScreen';
import ConsentCredentialURI from '../screens/ConsentCredentialURI';
import LoadingScreen from '../screens/LoadingScreen';
import ConsentCredentialOffer from '../screens/ConsentCredentialOffer';
import ConsentVPDefinition from '../screens/ConsentVPDefinition';
import ConsentAuthorization from '../screens/ConsentAuthorization';
import SelectAuthorizationScreen from '../screens/SelectAuthorizationScreen';
import VpDialog from '../screens/VPFlow';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestCredentialDialog from '../screens/RequestCredential';
import SolidScreen from '../screens/SolidScreen';


const Stack = createNativeStackNavigator();

/**
 * This stack navigator is used to display all the screens that are used in the
 * app after the user has logged in.
 * @returns A stack navigator with all the screens that are used in the app
 * after the user has logged in
 */
const HomeStackNavigator = () => {
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
      <Stack.Screen name='HomeScreen' component={HomeScreen} />
      <Stack.Screen
        name='CredentialListScreen'
        component={CredentialListScreen}
      />
      <Stack.Screen name='Profile' component={ProfileScreen} />


      <Stack.Screen
        name='SolidPOD'
        component={SolidScreen}
        options={{
          headerTitle: () => <Banner />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name='CredentialViewScreen'
        component={CredentialViewScreen}
      />
      <Stack.Screen name='Connect' component={LoginConsent} />
      <Stack.Screen name='RequestVC' component={RequestVC} />
      <Stack.Screen name='ScanScreen' component={ScanScreen} />
      <Stack.Screen name='Consent' component={LoginConsent} />
      <Stack.Screen name='DoneScreen' component={DoneScreen} />
      <Stack.Screen
        name='ConsentCredentialURI'
        component={ConsentCredentialURI}
      />
      <Stack.Screen
        name='ConsentCredentialOffer'
        component={ConsentCredentialOffer}
      />
      <Stack.Screen name='LoadingScreen' component={LoadingScreen} />
      <Stack.Screen
        name='ConsentVPDefinition'
        component={ConsentVPDefinition}
      />
      <Stack.Screen
        name='ConsentAuthorization'
        component={ConsentAuthorization}
      />
      <Stack.Screen
        name='SelectAuthorizationScreen'
        component={SelectAuthorizationScreen}
      />
      <Stack.Screen name='ConsentRequestObject' component={VpDialog} />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name='RequestCredential'
        component={RequestCredentialDialog}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
