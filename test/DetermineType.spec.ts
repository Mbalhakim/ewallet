import { determineTypeUtil } from '../helpers/DetermineTypeUtil'; // Import the determineTypeUtil function

describe('determineTypeUtil', () => {
  it('should determine the type of a verifiable credential', () => {
    // Define a sample verifiable credential
    const credential = {
      '2023-08-22T13:12:46.269Z': {
        credentialSchema: {
          id: 'VC-ID'
        }
      }
    };

    // Call determineTypeUtil with the sample credential
    const type = determineTypeUtil(credential);

    // Assert that the determined type matches the expected value
    expect(type).toBe('VC-ID');
  });
});
