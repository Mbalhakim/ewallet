import * as React from 'react';
import { Alert, Appearance, Text, View, Pressable, Button } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeContainer from '../components/HomeContainer';
import TailwindButton from '../components/TailwindButton';
import { useAuth } from '../context/AuthProvider';
import { createJWT } from '../util/RequestService';
import { useNavBar } from '../context/NavProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BottomSheet from '../components/BottomSheet';
import '../nativewind-env.d.ts';
import LogoIcon from '../assets/logopart.svg';

/**
 * This is the main menu screen.
 * It contains a list of buttons that navigate to other screens.
 * It also contains a button to log out.
 *
 * @returns A screen with a list of buttons and a logout button
 */

const HomeScreen = () => {
  const { logout } = useAuth();
  const { setNavBarShown } = useNavBar();

  useFocusEffect(() => {
    setNavBarShown(true);
  });
  const handleLogout = (): void => {
    logout();
    Alert.alert('Logout', 'You are now logged out');
  };
  useFocusEffect(() => {
    setNavBarShown(true);
  });

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

          <Text className='color-slate-800 font-anton text-xl'>Home</Text>
        </View>
        <Icon name='edit' size={30} />
      </HomeContainer.Header>
      <View className='flex-1 items-center justify-center'>
        <LogoIcon width={300} height={300} />
      </View>
    </HomeContainer>
  );
};

export default HomeScreen;
