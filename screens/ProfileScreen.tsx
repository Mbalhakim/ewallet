import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import HomeContainer from '../components/HomeContainer';
import '../nativewind-env.d.ts';
import { SavedCredentials } from '../util/types/Credential';
import { getData } from '../util/EncryptedStorage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import log from '../util/ReactLogger';
import { SolidData } from '../util/types/Storage';
import { StorageManager } from '../util/StorageManager';
import { StorageKeyEnums } from '../constants/const';
import { solidAuth } from '../util/SolidAuthService';

const ProfileScreen = () => {
  // State for data and UI
  const [credentials, setCredentials] = useState<SavedCredentials>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    id?: string;
    webId?: string;
  } | null>(null);
  const [solidData, setSolidData] = useState<SolidData | null>(null);

  const navigation = useNavigation();

  // Load credentials and check connection status
  useFocusEffect(
    useCallback(() => {
      // Load credentials
      getData(StorageKeyEnums.CREDENTIALS).then((creds) => {
        if (creds) {
          setCredentials(creds as SavedCredentials);
        }
      });
      setTimeout(() => {
        checkSolidConnectionStatus();
      }, 100);
      checkSolidConnectionStatus();
    }, [])
  );

  // Check if connected to Solid using the SolidAuthService
  const checkSolidConnectionStatus = async () => {
    try {
      const { isConnected: connected, connectionInfo: connInfo } =
        await solidAuth.checkConnectionStatus();

      const solidDataObj = await getData(StorageKeyEnums.SOLID_DATA);
      setSolidData(solidDataObj);

      setIsConnected(connected);

      if (connected && connInfo) {
        setConnectionInfo({
          id: solidDataObj.tokens?.secret_token || 'Unknown ID',
          webId: connInfo.webId || 'Unknown WebID'
        });
      } else {
        setConnectionInfo(null);
      }
    } catch (error) {
      log.error('Error checking connection status:', error);
      setIsConnected(false);
      setConnectionInfo(null);
    }
  };

  const getProfileInfo = () => {
    // Default to all unavailable
    return {
      id: 'Unavailable - No ID or passport VC found',
      firstName: 'Unavailable',
      lastName: 'Unavailable',
      dateOfBirth: 'Unavailable',
      gender: 'Unavailable',
      placeOfBirth: 'Unavailable'
    };
  };
  const profileInfo = getProfileInfo();
  const firstCredential = credentials[Object.keys(credentials)?.[0]];

  return (
    <HomeContainer>
      <HomeContainer.Header>
        <Text className='color-slate-800 font-anton text-xl'>Your profile</Text>
      </HomeContainer.Header>
      <HomeContainer.Body>
        <View className='flex flex-col gap-4'>
          {/* Personal information section */}
          <View className='flex flex-col gap-1'>
            <Text className='color-slate-800 font-anton text-lg font-semibold underline'>
              Personal information
            </Text>
            <Text>ID: {profileInfo.id}</Text>
            <Text>First name: {profileInfo.firstName}</Text>
            <Text>Last name: {profileInfo.lastName}</Text>
            <Text>Date of birth: {profileInfo.dateOfBirth}</Text>
            <Text>Gender: {profileInfo.gender}</Text>
            <Text>Place of birth: {profileInfo.placeOfBirth}</Text>
          </View>

          <View className='flex flex-col gap-1'>
            <Text className='color-slate-800 font-anton text-lg font-semibold underline'>
              Issuer information
            </Text>
            <Text>Issuer: Unavailable</Text>
            <Text>Issuance date: Unavailable</Text>
          </View>

          {/* Data Storage / Solid POD section - simplified */}
          <View className='mt-4 flex flex-col gap-1'>
            <Text className='color-slate-800 font-anton text-lg font-semibold underline'>
              Data Storage
            </Text>

            {/* Connection indicator */}
            <View className='rounded-md bg-gray-100 p-4'>
              <View className='mb-2 flex-row items-center justify-between'>
                <Text className='text-lg font-bold'>Solid POD</Text>
                <View className='flex-row items-center'>
                  <View
                    className={`mr-1 h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <Text
                    className={isConnected ? 'text-green-600' : 'text-red-600'}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>

              {connectionInfo && isConnected && (
                <View className='mb-3 rounded-md bg-gray-50 p-2'>
                  <Text className='text-sm text-gray-700'>
                    Client ID:{' '}
                    <Text className='font-mono'>
                      {connectionInfo.id?.substring(0, 15)}...
                    </Text>
                  </Text>
                  {connectionInfo.webId && (
                    <Text
                      className='text-sm text-gray-700'
                      numberOfLines={1}
                      ellipsizeMode='middle'
                    >
                      WebID:{' '}
                      <Text className='font-mono'>{connectionInfo.webId}</Text>
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity
                className='mt-3 rounded-md bg-blue-500 p-3'
                onPress={() => {
                  checkSolidConnectionStatus();
                  navigation.navigate('SolidPOD' as never);
                }}
              >
                <Text className='text-center font-medium text-white'>
                  Manage SOLID Connection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </HomeContainer.Body>
    </HomeContainer>
  );
};

export default ProfileScreen;
