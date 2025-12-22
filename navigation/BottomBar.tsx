import React, { createContext, useContext } from 'react';

import { useNavigation } from '@react-navigation/native';
import { Pressable, Text, View } from 'react-native';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons.js';
import Icon from 'react-native-vector-icons/MaterialIcons';
import '../nativewind-env.d.ts';
import BottomSheet from '../components/BottomSheet';
import { useNavBar } from '../context/NavProvider';
import CredentialsIcon from '../assets/credentialsIcon.svg';
import ProfileIcon from '../assets/profileIcon.svg';

const BottomBar = () => {
  const navigation = useNavigation();
  const navBar = useNavBar();

  const navToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  if (navBar.navBarShown) {
    return (
      <View className='flex flex-row items-center justify-between bg-ditblue-600 px-4 py-2'>
        <Pressable
          className='mt-1 flex flex-1 items-center justify-center'
          onPress={() => navToScreen('Profile')}
        >
          <ProfileIcon width={24} height={24} />
          <Text className='color-white mt-1'>Profile</Text>
        </Pressable>
        <Pressable
          className='relative flex flex-1 items-center justify-center'
          onPress={() => navToScreen('ScanScreen')}
        >
          <View className='absolute rounded-full border-2 border-solid border-white bg-ditblue-600 p-12'></View>
          <View className='absolute'>
            <Icon color='white' size={50} name='qr-code' />
            <Text className='color-white mb-2 text-center'>Scan</Text>
          </View>
        </Pressable>
        <View className='flex flex-1 flex-row items-center'>
          <Pressable
            className='flex flex-1 items-center justify-center mt-1'
            onPress={() => navToScreen('CredentialListScreen')}
          >
            <CredentialsIcon width={24} height={24} />
            <Text className='color-white mt-1'>Credentials</Text>
          </Pressable>
        </View>
      </View>
    );
  }
};
export default BottomBar;
