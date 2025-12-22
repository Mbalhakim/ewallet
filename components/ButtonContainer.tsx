import * as React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Border, Color, FontFamily, FontSize, Padding } from '../GlobalStyles';
import { deleteCredential } from '../util/EncryptedStorage';

/**
 * This component is used to display the buttons for either navigating back to
 * the overview screen or to present the credential.
 */
const ButtonContainer = ({ credential }) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  function deleteCredentialFromStorage(credential) {
    if (credential) {
      console.log(
        'credential doorgegeven bij delete Credential, nu delete aanroepen'
      );
      console.log(credential.credential);

      const credentialKey = Object.keys(credential.credential)[0];
      deleteCredential(credentialKey);
      navigation.navigate('HomeScreen');
    } else {
      console.log(
        'mogelijke foutsituatie, geen credential doorgegeven bij delete Credential'
      );
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.buttonContainer, styles.backButton]}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.buttonText}>Back to overview</Text>
        <Image
          style={styles.arrowIcon}
          resizeMode='cover'
          source={require('../assets/arrow_right.png')}
        />
      </Pressable>
      <Pressable
        style={[styles.buttonContainer, styles.presentVCButton]}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.buttonText}>Present VC</Text>
        <Image
          style={styles.arrowIcon}
          resizeMode='cover'
          source={require('../assets/arrow_right.png')}
        />
      </Pressable>
      <Pressable
        style={[styles.buttonContainer, styles.deleteVCButton]}
        onPress={() => deleteCredentialFromStorage({ credential })}
      >
        <Text style={styles.buttonText}>Delete VC</Text>
        <Image
          style={styles.arrowIcon}
          resizeMode='cover'
          source={require('../assets/arrow_right.png')}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: 300
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: Border.br_9xs,
    position: 'absolute',
    width: 300,
    paddingVertical: 4
  },
  backButton: {
    top: 34,
    backgroundColor: Color.primary
  },
  presentVCButton: {
    top: 0,
    backgroundColor: Color.success
  },
  deleteVCButton: {
    top: 68,
    backgroundColor: Color.danger
  },
  buttonText: {
    fontSize: FontSize.size_md,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: FontFamily.sans,
    color: Color.gray,
    textAlign: 'left',
    paddingLeft: Padding.p_xs
  },
  arrowIcon: {
    width: 24,
    height: 24,
    marginLeft: 4
  }
});

export default ButtonContainer;
