import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ButtonContainer from '../components/ButtonContainer';
import { deleteCredential } from '../util/EncryptedStorage';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  }),
  NavigationContainer: ({ children }) => <>{children}</>
}));

// Mock deleteCredential function
jest.mock('../util/EncryptedStorage', () => ({
  deleteCredential: jest.fn()
}));

describe('ButtonContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all buttons correctly', () => {
    const { getByText } = render(<ButtonContainer credential={{}} />);
    expect(getByText('Back to overview')).toBeTruthy();
    expect(getByText('Present VC')).toBeTruthy();
    expect(getByText('Delete VC')).toBeTruthy();
  });

  it('calls deleteCredentialFromStorage when Delete VC button is pressed', () => {
    // Mock credential with the key 'credential' since that's what the component uses
    const mockCredential = {
      credential: {
        type: ['VerifiableCredential'],
        issuer: 'test-issuer',
        '@context': ['https://www.w3.org/2018/credentials/v1']
      }
    };

    const { getByText } = render(
      <ButtonContainer credential={mockCredential} />
    );

    // Find and press the Delete VC button
    const deleteVCButton = getByText('Delete VC');
    fireEvent.press(deleteVCButton);

    // Verify deleteCredential was called with 'credential' as that's the key used
    expect(deleteCredential).toHaveBeenCalledWith('credential');
  });
});
