/**
 * WARNING: This screen crashes the app.
 * At some point, this screen was used to mock a credential req from an issuer.
 * This functionality has been removed from the app, but the screen has not been
 * removed yet.
 *
 * The app crashes when this screen is navigated to, due to the fact that it
 * intiates an infinite loop.
 * This bug was found at the end of the project, and was not fixed due to time
 * constraints.
 *
 * The code for this screen is left in the project, so that it can be fixed in
 * the future or used as a reference.
 *
 * Have a great day!
 * - liz-cpu
 *
 * Path: screens\RequestVC.tsx
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DropDownPicker from 'react-native-dropdown-picker';

import FloatingButton from '../components/FloatingButton';

import { Color, Padding } from '../GlobalStyles';

/**
 * This screen is used to display a list of issuers and a button to request a
 * credential from an issuer.
 *
 * @returns A screen with a list of issuers and a button to request a credential
 * from an issuer
 */
const RequestVC = () => {
  const [issuerListOpen, setIssuerListOpen] = useState(false);
  const [issuerListValue, setIssuerListValue] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <View style={styles.requestVC}>
      <View style={styles.issuerListLayout}>
        <View style={[styles.issuerList, styles.issuerListLayout]}>
          <DropDownPicker
            style={styles.dropdownpicker}
            open={issuerListOpen}
            setOpen={setIssuerListOpen}
            value={issuerListValue}
            setValue={setIssuerListValue}
            placeholder='Kies een issuer uit de List'
            labelStyle={styles.issuerListValue}
            dropDownContainerStyle={styles.issuerListdropDownContainer}
          />
        </View>
      </View>
      <FloatingButton
        title={`Credential aanvragen`}
        onPress={() => navigation.navigate('HomeScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fff'
  },
  issuerListValue: {
    color: '#230f80',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_medium'
  },
  issuerListdropDownContainer: {
    backgroundColor: '#f2f2f2'
  },
  issuerListLayout: {
    height: 58,
    width: 271
  },
  dropdownpicker: {
    backgroundColor: '#f2f2f2'
  },
  issuerList: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    paddingHorizontal: Padding.p_xs,
    paddingVertical: Padding.p_9xs,
    justifyContent: 'center'
  },
  requestVC: {
    flex: 1,
    width: '100%',
    height: 796,
    paddingHorizontal: Padding.p_3xs,
    paddingVertical: Padding.p_sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Color.light
  }
});

export default RequestVC;
