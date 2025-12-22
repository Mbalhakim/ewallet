import * as React from 'react';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DLStyle } from '../Styles';
import { getData } from '../util/EncryptedStorage';
import '../nativewind-env.d.ts';
import { StorageKeyEnums } from '../constants/const';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

/**
 * This component is used to display the credentials of the user.
 * It is a scrollable list of key-value pairs.
 * The data is stored in the encrypted storage.
 * If no data is found, a default object is used.
 *
 * @returns A credential component
 */
const CredentialContainer = ({ credential }) => {
  interface KeyValue {
    key: string;
    value: string;
    keyName: string;
  }

  const [keyValuePairs, setKeyValuePairs] = useState<KeyValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCredentials();
  }, [credential]);

  /**
   * If a credential is present, it will be used to set KV pairs. Otherwise a call will be done to look for a credential
   * to set KV pairs.
   */
  function setCredentials() {
    if (credential) {
      console.log('Credential container. Credential gevonden:' + credential);
      console.log(credential);
      setKVPairs(credential);
    } else {
      console.log(
        'route aanvragen, getdata haalt nu niet actief de vc meer op'
      );
      getData(StorageKeyEnums.CREDENTIALS).then((data) => {
        // console.log('credentials zoeken, in het geval er geen credential is:');
        if (data !== null && data !== undefined) {
          // console.log('credentials gevonden');
          const latestCredential = getLastValueFromJson(data);
          setKVPairs(latestCredential);
        } else {
          // console.log('geen credentials gevonden, mogelijke foutsituatie:');
        }
      });
    }
  }

  /**
   * Calls traverseObject to get the new pairs, than sets the keyvaluepairs and stops loading.
   */
  function setKVPairs(value) {
    // Call traverseObject here to get the new pairs
    const newPairs = traverseObject(value);
    // Update the state with the new pairs
    setKeyValuePairs(newPairs);
    // Update the loading state
    setLoading(false);
  }

  function getLastValueFromJson(json: any): any {
    if (json !== null && typeof json === 'object') {
      const keys = Object.keys(json);
      const lastKey = keys[keys.length - 1];
      return json[lastKey];
    }
  }

  /**
   * This function is used to traverse the object and store the key-value pairs.
   * Recursively traverses the object and stores the key-value pairs in the state.
   *
   * @param currentObj  The object to traverse
   * @param parentKey  The parent key
   */
  function traverseObject(
    currentObj: Record<string, string | object> | object
  ): KeyValue[] {
    const stack: {
      parentKey: string;
      obj: Record<string, string | object> | object;
    }[] = [{ obj: currentObj, parentKey: '' }];

    const newPairs: KeyValue[] = [];

    while (stack.length > 0) {
      const { obj, parentKey } = stack.pop()!;

      for (const key in obj) {
        const value = obj[key];
        const currentKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
          stack.push({ obj: value, parentKey: currentKey });
        } else {
          const keys = currentKey.split('.');
          const keyName = keys[keys.length - 1];
          newPairs.push({
            key: currentKey,
            value: value.toString(),
            keyName
          });
        }
      }
    }
    return newPairs;
  }

  // If the data is still loading, show a loading message
  if (loading) {
    return (
      <ScrollView>
        <View className='flex h-full items-center justify-center'>
          <Text className='color-slate-800 text-xl'>Loading...</Text>
        </View>
      </ScrollView>
    );
  } else {
    return (
      <ScrollView className='flex flex-col'>
        <View className='flex-1'>
          {keyValuePairs.map(({ key, value, keyName }) => (
            <View key={key} className='flex flex-row'>
              <Text className='text-l'>{keyName}: </Text>
              <Text>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }
};

export default CredentialContainer;
