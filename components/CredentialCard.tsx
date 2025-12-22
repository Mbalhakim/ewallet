import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import {
  determineTypeUtil,
  getIssuanceDate,
  getCredentialName,
  getExpirationDate,
  getCredentialId,
  getCredentialIssuer,
  getCredentialSubject,
  formatDate
} from '../helpers/DetermineTypeUtil';

/**
 * This component renders an individual credential as a card
 */
const CredentialCard = ({ item, onPress }) => {
  try {
    // Get the credential object
    const credentialKey = Object.keys(item)[0];
    const credential = item[credentialKey];

    if (!credential) {
      return null;
    }

    const name = getCredentialName(item);
    const issueDate = getIssuanceDate(item);
    const formattedIssueDate = formatDate(issueDate);
    const expirationDate = getExpirationDate(item);
    const formattedExpirationDate = formatDate(expirationDate);

    const issuer = getCredentialIssuer(item);
    const credentialId = getCredentialId(item);
    const subject = getCredentialSubject(item);

    const backgroundColor = '#4f83cc'; // blue

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className='mb-4 overflow-hidden rounded-xl'
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}
      >
        <View className='p-6' style={{ backgroundColor }}>
          {/* Card Header with Logo and Title*/}
          <View className='mb-2 flex-row items-center'>
            <Image
              source={require('../assets/ditlab-logo-512.png')}
              style={{ width: 40, height: 40, marginRight: 10 }}
              resizeMode='contain'
            />
            <Text className='flex-1 text-lg font-bold text-white'>{name}</Text>
          </View>

          {/* Credential ID Number */}
          {credentialId && (
            <View className='mb-3'>
              <Text className='text-s text-white/70'>CREDENTIAL ID</Text>
              <Text className='text-xs text-white'>
                {credentialId.substring(credentialId.lastIndexOf('/') + 1)}
              </Text>
            </View>
          )}

          {/* Card Footer */}
          <View className='flex flex-row items-end justify-between border-t border-white/20 pt-2'>
            <View>
              <Text className='text-xs text-white/70'>ISSUED</Text>
              <Text className='text-xs text-white'>{formattedIssueDate}</Text>
            </View>
            <View>
              <Text className='text-xs text-white/70'>EXPIRES</Text>
              <Text className='text-xs text-white'>
                {formattedExpirationDate}
              </Text>
            </View>
            <View>
              <Text className='text-xs text-white/70'>ISSUER</Text>
              <Text
                className='text-xs text-white'
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {typeof issuer === 'string'
                  ? issuer.replace(/^https?:\/\//, '').split('/')[0]
                  : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('Error rendering credential card:', error);
    return (
      <TouchableOpacity
        onPress={onPress}
        className='mb-2 rounded-lg bg-red-100 p-3'
      >
        <Text className='text-red-500'>Error displaying credential</Text>
      </TouchableOpacity>
    );
  }
};

export default CredentialCard;
