import * as React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getData } from '../util/EncryptedStorage';
import {
  determineTypeUtil,
  getIssuanceDate,
  getCredentialName
} from '../helpers/DetermineTypeUtil';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TailwindButton from './TailwindButton';
import { StorageKey } from '../constants/const';
import CredentialCard from './CredentialCard';

/**
 * This is the demo credential that is shown if no credentials are found for this user. Type VC-ID.
 */
const initialCredentialList = [
  {
    '2023-08-22T13:12:46.269Z': {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      credentialSchema: {
        id: 'VC-ID Example',
        type: 'FullJsonSchemaValidator2021'
      },
      credentialSubject: {
        dateOfBirth: '2022-10-18T22:00:00.000Z',
        familyName: 'Jansen',
        firstName: 'Joop',
        gender: 'Man',
        id: '578899766',
        nameAndFamilyNameAtBirth: 'Joop, Jansen',
        personalIdentifier: '8888888889',
        placeOfBirth: 'Groningen'
      },
      id: 'urn:uuid:1bc957f1-f160-4de8-ae15-dc636c654f77',
      issuanceDate: '2023-03-21T09:21:57.939572546Z',
      issued: '2023-08-22T13:12:46.269Z',
      issuer: 'http://issuer-gemeente.westeurope.azurecontainer.io:3000',
      proof: {
        created: '2023-08-22T13:12:46.269Z',
        jws: 'eyJhbGciOiJSUzI1NiJ9..AFpb-ZbDNbFgUDHYrlSf2Kgli5I_0-O4q2BRTMOw-T-0kAynG4bcu8tXQp36j2geQ5hUD89yPn44XxrtrS9TDgnvDba9zLE7WrAwEgql-aCDAHmYL34ktRmQ1xbG2Ms5B8_690I4Yr-CaITohKDsQ3QTySW-fjRZKGOEuwVbkU_mUKmNwQvnTvn4avFt66t9sQvOJkIoXgS8Lro10gKfyDVgEbArIgVGtSl_M7oEIWiNKmazWoPpUKpyNhhGTod9Y5BsJdoniuGg2DJj6LH4PDauZ5iJHew82iElmclBqwOKQZhWFQBW8vnK3Ybl-scGkZjjECxOd9JOMGFORuPk6A',
        proofPurpose: 'assertionMethod',
        type: 'JsonWebSignature2020'
      },
      type: ['VerifiableCredential', 'VerifiableAttestation', 'VerifiableId'],
      validFrom: '2023-08-22T13:12:46.269Z'
    }
  }
];

const CredentialList = () => {
  const [credentialsArray, setCredentialsArray] = useState(
    initialCredentialList
  );
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useEffect(() => {
    getCredentials();
    const pollInterval = setInterval(
      () => {
        getCredentials();
      },
      1 * 3 * 1000
      // elke 3 seconden
    );

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  function getCredentials() {
    getData(StorageKey.CREDENTIALS).then((data) => {
      // console.log('credentials zoeken :  ');
      if (data !== null && data !== undefined) {
        // console.log('credentials gevonden');

        const extractedJsons = Object.keys(data).map((key) => {
          return {
            [key]: data[key]
          };
        });
        setCredentialsArray(extractedJsons);
      } else {
        console.log('geen credentials gevonden:');
        setCredentialsArray(initialCredentialList);
      }
    });
  }

  // Format date for display with time included
  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString.substring(0, 16);
    }
  }
  return (
    <ScrollView className='flex flex-col gap-2'>
      {credentialsArray.map((item, index) => {
        try {
          if (!item) {
            return null;
          }

          const name = getCredentialName(item);
          const type = determineTypeUtil(item);
          const issuanceDateString = getIssuanceDate(item);
          const formattedDate = formatDate(issuanceDateString);

          return (
            <CredentialCard
              key={index}
              item={item}
              onPress={() =>
                navigation.navigate('CredentialViewScreen', {
                  credential: item
                })
              }
            />
          );
        } catch (error) {
          console.error('Error rendering credential:', error);
          return (
            <View key={`error-${index}`} className='mb-1'>
              <Text className='text-red-500'>Error displaying credential</Text>
            </View>
          );
        }
      })}
    </ScrollView>
  );
};

export default CredentialList;
