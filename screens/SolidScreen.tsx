import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import log from '../util/ReactLogger';
import HomeContainer from '../components/HomeContainer';
import * as SolidPod from '../util/SolidPodService';
import { getData, storeData } from '../util/EncryptedStorage';
import {
  SOLID_PROVIDERS,
  DEMO_ACCOUNT,
  Demo_WebId,
  STORAGE_KEYS
} from '../constants/const';
import { RadioButton } from 'react-native-paper';

export const SolidScreen = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] =
    useState<SolidPod.ConnectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Login form state
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [webId, setWebId] = useState('');
  const [useDemoAccount, setUseDemoAccount] = useState(false);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [keyDetails, setKeyDetails] = useState<{
    did?: string;
    publicKey?: string;
    privateKey?: string;
    createdAt?: string;
    device?: string;
  } | null>(null);

  // states for backup details
  const [showBackupDetails, setShowBackupDetails] = useState(false);
  const [backupDetails, setBackupDetails] = useState<{
    didKeys?: boolean;
    credentials?: boolean;
    credentialCount?: number;
    userCredentials?: boolean;
    issuerData?: boolean;
    fullBackup?: boolean;
  } | null>(null);

  const navigation = useNavigation();

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check if connected to SOLID POD
  const checkConnectionStatus = async () => {
    const { isConnected, connectionInfo } =
      await SolidPod.checkConnectionStatus();
    setIsConnected(isConnected);
    setConnectionInfo(connectionInfo);
  };

  const handleProviderSelect = async (providerUrl) => {
    if (!providerUrl) {
      setStatusMessage('Please select a provider');
      return;
    }

    // Open login modal
    showAuthModal();
    // Pre-fill with demo account if it's the default provider
    if (providerUrl === SOLID_PROVIDERS[0].url) {
      toggleDemoAccount();
    }
  };

  //  authentication modal
  const showAuthModal = () => {
    setEmail('');
    setPassword('');
    setWebId('');
    setUseDemoAccount(false);
    setStatusMessage('');
    setIsError(false);
    setModalVisible(true);
  };

  //  demo account
  const toggleDemoAccount = () => {
    setUseDemoAccount(!useDemoAccount);
    if (!useDemoAccount) {
      // Set demo credentials when enabling
      setEmail(DEMO_ACCOUNT.email);
      setPassword(DEMO_ACCOUNT.password);
      setWebId(Demo_WebId); // Demo WebID
    } else {
      // Clear when disabling
      setEmail('');
      setPassword('');
      setWebId('');
    }
  };

  // Handle authentication with credentials
  const handleAuth = async () => {
    if (!email || !password) {
      setStatusMessage('Email and password are required');
      setIsError(true);
      return;
    }

    setModalVisible(false);
    setIsLoading(true);
    setStatusMessage('Connecting to Solid POD...');
    setIsError(false);

    const result = await SolidPod.loginWithPassword(email, password, webId);

    setIsConnected(result.isConnected);
    setConnectionInfo(result.connectionInfo);
    setStatusMessage(result.message);
    setIsError(!result.isConnected);
    setIsLoading(false);
  };

  // Disconnect from Solid POD
  const disconnectSolid = async () => {
    setIsLoading(true);
    setStatusMessage('Disconnecting...');
    setIsError(false);

    const result = await SolidPod.disconnect();

    const status = await SolidPod.checkConnectionStatus();

    //  check result to update UI
    setIsConnected(status.isConnected);
    setConnectionInfo(status.connectionInfo);
    setStatusMessage(
      result.message + (status.isConnected ? ' (Warning: Still connected)' : '')
    );
    setIsError(status.isConnected);
    setIsLoading(false);

    // Reset any keys or backup details
    setKeyDetails(null);
    setBackupDetails(null);

    log.info(
      'SolidScreen: Disconnected, connection status:',
      status.isConnected
    );
  };

  // Function to backup DID keys to SOLID POD
  const backupKeysToSolidPod = async () => {
    if (!isConnected) {
      setStatusMessage('Please connect to your SOLID POD first');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Backing up DID keys to SOLID POD...');
    setIsError(false);

    try {
      const result = await SolidPod.backupDidKeys();

      setStatusMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        Alert.alert(
          'Backup Successful',
          'Your DID keys have been securely backed up to your SOLID POD.'
        );
      } else {
        Alert.alert(
          'Backup Failed',
          `There was a problem backing up your keys: ${result.message}`
        );
      }
    } catch (error) {
      log.error('Error backing up keys:', error);
      setStatusMessage(`Failed to back up keys: ${error.message}`);
      setIsError(true);
      Alert.alert(
        'Backup Failed',
        `There was a problem backing up your keys: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to backup all wallet data to SOLID POD
  const backupAllDataToSolidPod = async () => {
    if (!isConnected) {
      setStatusMessage('Please connect to your SOLID POD first');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Backing up all wallet data to SOLID POD...');
    setIsError(false);

    try {
      const result = await SolidPod.backupAllData();

      setStatusMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        Alert.alert(
          'Backup Successful',
          'All your wallet data has been securely backed up to your SOLID POD.'
        );
      } else {
        Alert.alert(
          'Backup Partially Failed',
          `Some data could not be backed up: ${result.message}`
        );
      }
    } catch (error) {
      log.error('Error backing up all data:', error);
      setStatusMessage(`Failed to back up all data: ${error.message}`);
      setIsError(true);
      Alert.alert(
        'Backup Failed',
        `There was a problem backing up your data: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to restore DID keys from SOLID POD
  const restoreKeysFromSolidPod = async () => {
    if (!isConnected) {
      setStatusMessage('Please connect to your SOLID POD first');
      setIsError(true);
      return;
    }

    // Confirm before overwriting local keys
    Alert.alert(
      'Restore Keys',
      'This will overwrite your current DID keys with the ones stored in your SOLID POD. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            setIsLoading(true);
            setStatusMessage('Restoring DID keys from SOLID POD...');
            setIsError(false);

            try {
              const result = await SolidPod.restoreDidKeys();

              setStatusMessage(result.message);
              setIsError(!result.success);

              if (result.success) {
                Alert.alert(
                  'Restore Successful',
                  'Your DID keys have been restored from your SOLID POD.'
                );
              } else {
                Alert.alert(
                  'Restore Failed',
                  `There was a problem restoring your keys: ${result.message}`
                );
              }
            } catch (error) {
              log.error('Error restoring keys:', error);
              setStatusMessage(`Failed to restore keys: ${error.message}`);
              setIsError(true);
              Alert.alert(
                'Restore Failed',
                `There was a problem restoring your keys: ${error.message}`
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to restore all data from SOLID POD
  const restoreAllDataFromSolidPod = async () => {
    if (!isConnected) {
      setStatusMessage('Please connect to your SOLID POD first');
      setIsError(true);
      return;
    }

    // Confirm before overwriting local data
    Alert.alert(
      'Restore All Data',
      'This will overwrite your current wallet data with the data stored in your SOLID POD. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            setIsLoading(true);
            setStatusMessage('Restoring all data from SOLID POD...');
            setIsError(false);

            try {
              const result = await SolidPod.restoreAllData();

              setStatusMessage(result.message);
              setIsError(!result.success);

              if (result.success) {
                Alert.alert(
                  'Restore Successful',
                  'All your wallet data has been restored from your SOLID POD.'
                );
              } else {
                Alert.alert(
                  'Restore Partially Failed',
                  `Some data could not be restored: ${result.message}`
                );
              }
            } catch (error) {
              log.error('Error restoring all data:', error);
              setStatusMessage(`Failed to restore all data: ${error.message}`);
              setIsError(true);
              Alert.alert(
                'Restore Failed',
                `There was a problem restoring your data: ${error.message}`
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to view backup status
  const viewBackupStatus = async () => {
    try {
      // Check if connected
      if (!isConnected || !connectionInfo) {
        Alert.alert('Not Connected', 'Please connect to your Solid POD first.');
        return;
      }

      setIsLoading(true);
      setStatusMessage('Checking backup status in Solid POD...');

      const result = await SolidPod.checkPodBackupStatus();

      if (result.success) {
        // Set the backup details for display
        setBackupDetails(result.available);

        // Show the modal
        setShowBackupDetails(true);
        setStatusMessage('');
      } else {
        setStatusMessage(result.message);
        setIsError(true);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      log.error('Error checking backup status:', error);
      setStatusMessage(`Failed to check backup status: ${error.message}`);
      setIsError(true);
      Alert.alert('Error', `Failed to check backup status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomeContainer>
      <HomeContainer.Header>
        <Text className='color-slate-800 font-anton text-xl'>
          Solid POD Connection
        </Text>
      </HomeContainer.Header>

      <HomeContainer.Body>
        <ScrollView>
          <View>
            <Text className='color-slate-800 mb-4 text-lg'>
              Connect to your Solid data pod to access and store your data
              securely.
            </Text>

            {statusMessage ? (
              <View
                className={`mb-4 rounded-lg border p-3 ${
                  isError
                    ? 'border-red-300 bg-red-100'
                    : 'border-green-300 bg-green-100'
                }`}
              >
                <Text className={isError ? 'text-red-700' : 'text-green-700'}>
                  {statusMessage}
                </Text>
              </View>
            ) : null}

            {/* Connection indicator */}
            <View className='mb-6 rounded-md bg-gray-100 p-4'>
              <View className='mb-2 flex-row items-center justify-between'>
                <Text className='text-lg font-bold'>Solid POD</Text>
                {isLoading ? (
                  <ActivityIndicator size='small' color='#4C8BF5' />
                ) : (
                  <View className='flex-row items-center'>
                    <View
                      className={`mr-1 h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <Text
                      className={
                        isConnected ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {isConnected ? 'Connected' : 'Not connected'}
                    </Text>
                  </View>
                )}
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
            </View>

            {!isConnected ? (
              <View>
                <Text className='color-slate-800 mb-3 font-semibold'>
                  Connect with a provider:
                </Text>

                {SOLID_PROVIDERS.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    onPress={() => setSelectedProvider(provider.url)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <RadioButton
                      value={provider.url}
                      status={
                        selectedProvider === provider.url
                          ? 'checked'
                          : 'unchecked'
                      }
                      color={provider.color}
                      onPress={() => setSelectedProvider(provider.url)}
                    />
                    <Text className='text-center font-semibold text-white'>
                      {provider.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  className='mb-3 rounded-lg bg-blue-500 p-4'
                  onPress={() => handleProviderSelect(selectedProvider)}
                >
                  <Text className='text-center font-semibold text-white'>
                    Login with Credentials
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Backup section */}
                <View className='mb-6'>
                  <Text className='color-slate-800 mb-3 font-semibold'>
                    Backup to Solid POD:
                  </Text>
                  <View className='flex-col gap-3'>
                    <TouchableOpacity
                      onPress={backupAllDataToSolidPod}
                      disabled={isLoading}
                      className='rounded-md bg-blue-600 px-4 py-3 shadow-sm'
                    >
                      <Text className='text-center font-semibold text-white'>
                        Backup All Wallet Data
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={backupKeysToSolidPod}
                      disabled={isLoading}
                      className='rounded-md bg-blue-500 px-4 py-3 shadow-sm'
                    >
                      <Text className='text-center font-semibold text-white'>
                        Backup DID Keys Only
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Restore section */}
                <View className='mb-6'>
                  <Text className='color-slate-800 mb-3 font-semibold'>
                    Restore from Solid POD:
                  </Text>
                  <View className='flex-col gap-3'>
                    <TouchableOpacity
                      onPress={restoreAllDataFromSolidPod}
                      disabled={isLoading}
                      className='rounded-md bg-green-700 px-4 py-3 shadow-sm'
                    >
                      <Text className='text-center font-semibold text-white'>
                        Restore All Wallet Data
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={restoreKeysFromSolidPod}
                      disabled={isLoading}
                      className='rounded-md bg-green-600 px-4 py-3 shadow-sm'
                    >
                      <Text className='text-center font-semibold text-white'>
                        Restore DID Keys Only
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* View section */}
                <View className='mb-6'>
                  <Text className='color-slate-800 mb-3 font-semibold'>
                    View Solid POD Data:
                  </Text>
                  <View className='flex-col gap-3'>
                    <TouchableOpacity
                      onPress={viewBackupStatus}
                      className='rounded-md bg-slate-600 px-4 py-3 shadow-sm'
                    >
                      <Text className='text-center font-semibold text-white'>
                        View Backup Status
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Disconnect button */}
                <TouchableOpacity
                  onPress={disconnectSolid}
                  disabled={isLoading}
                  className='mt-4 rounded-md bg-red-600 px-4 py-3'
                >
                  <Text className='text-center font-medium text-white'>
                    Disconnect from SOLID POD
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </HomeContainer.Body>

      {/* Authentication Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className='flex-1 justify-center bg-black/40 px-4'>
          <View className='rounded-lg bg-white p-5 shadow-lg'>
            <Text className='mb-4 text-center text-xl font-semibold'>
              Login with Credentials
            </Text>

            <View className='mb-4 flex-row items-center justify-between'>
              <Text className='text-base'>Use demo account</Text>
              <Switch
                value={useDemoAccount}
                onValueChange={toggleDemoAccount}
                trackColor={{ false: '#767577', true: '#4C8BF5' }}
              />
            </View>

            <TextInput
              className='mb-4 rounded-md border border-gray-300 bg-white p-3'
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
            />

            <TextInput
              className='mb-4 rounded-md border border-gray-300 bg-white p-3'
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              className='mb-4 rounded-md border border-gray-300 bg-white p-3'
              placeholder='WebID (optional)'
              value={webId}
              onChangeText={setWebId}
              autoCapitalize='none'
            />

            <View className='mt-4 flex-row gap-2'>
              <TouchableOpacity
                className='flex-1 rounded-md bg-gray-400 p-3'
                onPress={() => setModalVisible(false)}
              >
                <Text className='text-center text-white'>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-1 rounded-md bg-blue-500 p-3'
                onPress={handleAuth}
              >
                <Text className='text-center text-white'>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Key Details Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={showKeyDetails}
        onRequestClose={() => setShowKeyDetails(false)}
      >
        <View className='flex-1 justify-center bg-black/40 px-4'>
          <View className='rounded-lg bg-white p-5 shadow-lg'>
            <Text className='mb-4 text-center text-xl font-semibold'>
              Solid POD Key Details
            </Text>

            {keyDetails && (
              <ScrollView className='mb-4 max-h-96'>
                <Text className='mb-2 font-bold'>DID Identifier:</Text>
                <Text className='mb-3 font-mono' selectable={true}>
                  {keyDetails.did}
                </Text>

                <Text className='mb-2 font-bold'>Public Key:</Text>
                <Text className='mb-3 font-mono' selectable={true}>
                  {keyDetails.publicKey}
                </Text>

                <Text className='mb-2 font-bold'>Private Key:</Text>
                <Text className='mb-3 font-mono' selectable={true}>
                  {keyDetails.privateKey}
                </Text>

                <Text className='mt-2 italic text-gray-600'>
                  Created:{' '}
                  {keyDetails.createdAt
                    ? new Date(keyDetails.createdAt).toLocaleString()
                    : 'Unknown'}
                </Text>
                <Text className='mt-1 italic text-gray-600'>
                  Device: {keyDetails.device}
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity
              className='mt-4 rounded-md bg-blue-500 p-3'
              onPress={() => setShowKeyDetails(false)}
            >
              <Text className='text-center text-white'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Backup Details Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={showBackupDetails}
        onRequestClose={() => setShowBackupDetails(false)}
      >
        <View className='flex-1 justify-center bg-black/40 px-4'>
          <View className='rounded-lg bg-white p-5 shadow-lg'>
            <Text className='mb-4 text-center text-xl font-semibold'>
              Backup Status
            </Text>

            {backupDetails && (
              <ScrollView className='mb-4 max-h-96'>
                <View className='rounded-md bg-gray-100 p-4'>
                  <Text className='mb-4 text-lg font-bold'>
                    Available Backups in Solid POD:
                  </Text>

                  <View className='mb-2 flex-row justify-between'>
                    <Text className='font-semibold'>DID Keys:</Text>
                    <Text
                      className={
                        backupDetails.didKeys
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {backupDetails.didKeys ? 'Available' : 'Not Found'}
                    </Text>
                  </View>

                  <View className='mb-2 flex-row justify-between'>
                    <Text className='font-semibold'>User Profile:</Text>
                    <Text
                      className={
                        backupDetails.userCredentials
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {backupDetails.userCredentials
                        ? 'Available'
                        : 'Not Found'}
                    </Text>
                  </View>

                  <View className='mb-2 flex-row justify-between'>
                    <Text className='font-semibold'>Credentials:</Text>
                    <Text
                      className={
                        backupDetails.credentials
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {backupDetails.credentials ? 'Available' : 'Not Found'}
                    </Text>
                  </View>

                  <View className='mb-2 flex-row justify-between'>
                    <Text className='font-semibold'>Issuer Data:</Text>
                    <Text
                      className={
                        backupDetails.issuerData
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {backupDetails.issuerData ? 'Available' : 'Not Found'}
                    </Text>
                  </View>

                  <View className='mt-2 flex-row justify-between'>
                    <Text className='font-semibold'>Complete Backup:</Text>
                    <Text
                      className={
                        backupDetails.fullBackup
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {backupDetails.fullBackup ? 'Available' : 'Not Found'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View className='mt-4 flex-row gap-2'>
              <TouchableOpacity
                className='flex-1 rounded-md bg-blue-500 p-3'
                onPress={() => setShowBackupDetails(false)}
              >
                <Text className='text-center text-white'>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-1 rounded-md bg-green-600 p-3'
                onPress={() => {
                  setShowBackupDetails(false);
                  backupAllDataToSolidPod();
                }}
              >
                <Text className='text-center text-white'>Backup Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </HomeContainer>
  );
};

export default SolidScreen;
