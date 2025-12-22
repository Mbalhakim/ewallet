import React, { useState } from 'react';
import { FlatList, View } from 'react-native';

import { DLStyle } from '../Styles';

import MenuButton from './MenuButton';

/**
 * This component is used to display a QR scanner container.
 *
 * @returns A button for the QR scanner
 *
 */

const QRScanContainer = () => {
  const [credentialsFlatListData, setCredentialsFlatListData] = useState([
    <MenuButton buttonLabel='QR Code Scanner' screenName='ScanScreen' />
  ]);

  return (
    <View style={DLStyle.qrView}>
      <FlatList
        style={DLStyle.buttonListContainer}
        data={credentialsFlatListData}
        renderItem={({ item }) => item}
      />
    </View>
  );
};

export default QRScanContainer;
