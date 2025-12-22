import * as React from 'react';
import {
  StyleSheet,
  Text,
  ViewStyle,
  Pressable,
  StyleProp
} from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Border, Color, FontFamily, FontSize } from '../GlobalStyles';

type HomeButtonType = {
  style?: StyleProp<ViewStyle>;
};

/**
 * This component is used to display the buttons for navigating back to
 * the home screen.
 *
 * @returns HomeButton
 */
const HomeButton = ({ style }: HomeButtonType) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <Pressable
      style={[styles.credentialLayout, style]}
      onPress={() => navigation.navigate('HomeScreen')}
    >
      <Pressable style={[styles.credentialChild, styles.credentialLayout]} />
      <Text style={styles.credentialtekst}>Back to home</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  credentialLayout: {
    marginBottom: 4,
    height: 69,
    width: 279
  },
  credentialChild: {
    top: 0,
    left: 0,
    borderRadius: Border.br_lg,
    backgroundColor: Color.gray,
    position: 'absolute'
  },
  credentialtekst: {
    top: 25,
    left: 19,
    fontSize: FontSize.size_xl,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: FontFamily.sans,
    color: Color.dark,
    textAlign: 'left',
    width: 242,
    height: 30,
    position: 'absolute'
  }
});

export default HomeButton;
