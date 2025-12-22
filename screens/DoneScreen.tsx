import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import HomeButton from '../components/HomeButton';

import { DLStyle } from '../Styles';


/**
 * This screen is used to display a success message after completing a flow.
 *
 * @returns A screen with a success message and a home button
 */
const DoneScreen = ({ route }) => {
  const {
    params: { message }
  } = route;
  return (
    <View className='flex h-full justify-around items-center'>
      <View>
        <Text className='color-slate-800 text-center text-2xl font-bold'>{message}</Text>
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

export default DoneScreen;
