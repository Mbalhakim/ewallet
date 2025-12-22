import { stringLengthCheck } from '../util/Validation';

describe('stringLenght function', () => {
  // Test case for checkStringLenght function
  it('should return false if username is less than 6 characters', () => {
    const result = stringLengthCheck('user'); // Pass a username with less than 6 characters
    expect(result).toBe(false); // Expect the result to be false
  });

  // Test case for checkStringLenght function
  it('should return true if username is more than 6 characters', () => {
    const result = stringLengthCheck('username'); // Pass a username with more than 6 characters
    expect(result).toBe(true); // Expect the result to be true
  });
});
