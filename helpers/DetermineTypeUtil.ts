import { CredentialAdapter } from '../util/CredentialAdapter';

// Get credential type
export function determineTypeUtil(credential) {
  return CredentialAdapter.getType(credential);
}

// Get issuance date
export function getIssuanceDate(credential) {
  return CredentialAdapter.getIssuanceDate(credential);
}

// Format date string
export function formatDate(dateString) {
  return CredentialAdapter.formatDate(dateString);
}

// Get credential name
export function getCredentialName(credential) {
  return CredentialAdapter.getName(credential);
}

// Get expiration date
export function getExpirationDate(credential) {
  return CredentialAdapter.getExpirationDate(credential);
}

// Get credential ID
export function getCredentialId(credential) {
  return CredentialAdapter.standardizeCredential(credential).id;
}

// Get credential issuer
export function getCredentialIssuer(credential) {
  return CredentialAdapter.getIssuer(credential);
}

// Get credential subject
export function getCredentialSubject(credential) {
  return CredentialAdapter.standardizeCredential(credential).subject;
}
