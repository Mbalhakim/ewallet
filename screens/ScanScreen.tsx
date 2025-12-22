import * as React from 'react';
import { useState } from 'react';
import { StyleProp, StyleSheet, TextInput, ViewStyle } from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Linking from '../Linking';
import HomeContainer from '../components/HomeContainer';
import '../nativewind-env.d.ts';

import { URIParams } from '../util/DataTypes';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner
} from 'react-native-vision-camera';
import TailwindButton from '../components/TailwindButton';

type ScanType = {
  style?: StyleProp<ViewStyle>;
};

/**
 * This function is used to get query parameters from a URI, due to the fact
 * that the URLSearchParams API is not available in React Native.
 *
 * @param URI the URI to get the query parameters from
 * @returns an object containing the query parameters
 */
function extractQueryParams(URI: string): URIParams {
  const uriDecoded = decodeURI(URI);
  return uriDecoded
    .split('?')[1]
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      return { ...params, [key]: value };
    }, {}) as URIParams;
}

/**
 * This screen is used to scan a QR code and extract the parameters from it
 *
 * @param style the style of the screen
 * @returns a screen with a camera to scan a QR code and a home button
 */
const Scanner = ({ style }: ScanType) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [text, setText] = useState('');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      const url = codes[0].value;
      if (
        Linking.prefixes.some((prefix) => url?.startsWith(prefix)) &&
        url != null
      ) {
        const urlParams = extractQueryParams(url);
        navigation.navigate('LoadingScreen', {
          ...urlParams
        });
      }
    }
  });

  // If a QR code is scanned, we check if it contains a compatible deeplink URI
  const handleOnScan = ({ barcodes }): void => {
    if (barcodes.length > 0 && Linking.prefixes != null) {
      const url = barcodes[0].data;
      if (Linking.prefixes.some((prefix) => url.startsWith(prefix))) {
        const urlParams = extractQueryParams(url);
        navigation.navigate('LoadingScreen', {
          ...urlParams
        });
      }
    }
  };

  React.useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, []);

  const handleInputChange = (input) => {
    setText(input);
  };

  const uriInput = () => {
    const urlParams = extractQueryParams(text);
    navigation.navigate('LoadingScreen', {
      ...urlParams
    });
  };

  return (
    <HomeContainer>
      <HomeContainer.Header>
        <TextInput
          style={{
            height: 50,
            margin: 12,
            borderWidth: 1,
            padding: 10,
            flex: 1
          }}
          className='color-slate-800 mt-2 font-anton text-xl'
          onChangeText={handleInputChange}
          value={text}
          placeholder={'Scan QR or insert URI here'}
        />
        <TailwindButton text={'SUBMIT'} onPress={uriInput} />
      </HomeContainer.Header>
      {hasPermission && (
        <HomeContainer.Body>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            codeScanner={codeScanner}
            isActive={true}
          />
        </HomeContainer.Body>
      )}
    </HomeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  }
});

export default Scanner;
