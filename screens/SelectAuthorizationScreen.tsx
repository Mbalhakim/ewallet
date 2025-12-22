import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import HomeButton from '../components/HomeButton';

import { DLStyle } from '../Styles';


/**
 * This screen is used to select a presentation for the authorization flow.
 *
 * @returns A screen with a success message and a home button
 */
const SelectAuthorizationScreen = ({ route }) => {
  const {
    params: { message }
  } = route;
  return (
    <View style={DLStyle.container}>
      <View style={styles.done}>
        <Text style={DLStyle.h1}>{ message }</Text>
      </View>
      <HomeButton />
    </View>
  );
};

const styles = StyleSheet.create({
  done: {
    width: 265,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13
  },
});

export default SelectAuthorizationScreen;
