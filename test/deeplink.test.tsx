import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

describe('Linking', () => {
  it('should export the correct Linking object', () => {
    // Import the Linking object from the module
    const Linking = require('../Linking').default;

    // Check if the prefixes and config properties are correct
    expect(Linking.prefixes).toEqual([
      'app://ditlabwallet7',
      'siopv2://',
      'openid-credential-offer://',
      '/authorize'
    ]);
  });
});
