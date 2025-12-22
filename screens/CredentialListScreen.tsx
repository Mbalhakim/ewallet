import * as React from 'react';
import { Alert, Appearance, Text, View, Pressable } from 'react-native';

import CredentialList from '../components/CredentialList';

import { useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeContainer from '../components/HomeContainer';
import TailwindButton from '../components/TailwindButton';
import { useAuth } from '../context/AuthProvider';
import { useNavBar } from '../context/NavProvider';
import BottomSheet from '../components/BottomSheet';
import { useNavigation } from '@react-navigation/native';

/**
 * This is the main menu screen.
 * It contains a list of buttons that navigate to other screens.
 * It also contains a button to log out.
 *
 * @returns A screen with a list of buttons and a logout button
 */
const CredentialListScreen = () => {
  const { logout } = useAuth();
  const { setNavBarShown } = useNavBar();
  const navigation = useNavigation();

  // If the user logs out, we call the logout function and display an alert
  const handleLogout = (): void => {
    logout();
    Alert.alert('Logout', 'You are now logged out');
  };
  useEffect(() => {
    setNavBarShown(true);
    console.log(Appearance.getColorScheme());
  }, []);

  return (
    <HomeContainer>
      <HomeContainer.Header>
        <View className='flex flex-row items-center gap-1'>
          <BottomSheet>
            <BottomSheet.Trigger>
              <Icon name='menu' size={30} />
            </BottomSheet.Trigger>
            <BottomSheet.Content>
              <Text className='color-gray-50 text-xl'>Item 1</Text>
              <Pressable onPress={handleLogout}>
                <Text className='color-gray-50 text-xl'>Log Out</Text>
              </Pressable>
            </BottomSheet.Content>
          </BottomSheet>
          <Text className='color-slate-800 font-anton text-xl'>
            Credentials
          </Text>
        </View>
        <View className='flex flex-row gap-2'>
          <Icon name='edit' size={30} />
          <Pressable
            onPress={() =>
              navigation.navigate('RequestCredential', {
                credential_offer_uri: null
              })
            }
          >
            <Icon name='add' size={30} />
          </Pressable>
        </View>
      </HomeContainer.Header>
      <HomeContainer.Body>
        <CredentialList />
      </HomeContainer.Body>
    </HomeContainer>
  );
};

export default CredentialListScreen;
