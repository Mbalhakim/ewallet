import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import '../nativewind-env.d.ts';
import TailwindButton from './TailwindButton';

/**
 * This component is used to display the consent buttons on the consent screen.
 *
 * @param onAccept The function to be called when the accept button is pressed
 * @param onReject The function to be called when the reject button is pressed
 * @returns A view with two buttons
 */
const ConsentButtons = ({ onAccept, onReject }) => {
  return (
    <View className='mt-2 flex flex-row items-center justify-center gap-8'>
      <TailwindButton
        className='shadow-md shadow-ditblue-800'
        size='large'
        text='Accept'
        variant='primary'
        onPress={onAccept}
      />
      <TailwindButton
        className='shadow-md shadow-ditblue-800'
        size='large'
        text='Reject'
        variant='secondary'
        onPress={onReject}
      />
    </View>
  );
};

export default ConsentButtons;
