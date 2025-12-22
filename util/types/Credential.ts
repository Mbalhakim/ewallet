export type SavedCredentials = Record<string, VcIdModel>;

export type StoredCredentials = Record<string, SavedCredentials>;

export interface VcIdModel {
  '@context': string[];
  credentialSchema: CredentialSchema;
  credentialSubject: CredentialSubjectModel;
  id: string;
  issued: string;
  issuer: string;
  validFrom: string;
  issuanceDate: string;
  type: string[];
  proof: CredentialProofModel;
  //Temporary solution
  sessionId?: string;
}

export interface CredentialSchema {
  type: string;
  id: string;
}

export interface CredentialSubjectModel {
  dateOfBirth: string;
  familyName: string;
  firstName: string;
  gender: string;
  id: string;
  nameAndFamilyNameAtBirth: string;
  personalIdentifier: string;
  placeOfBirth: string;
}

export interface CredentialProofModel {
  type?: string;
  created: string;
  verificationMethod?: string;
  jws?: string;
  proofPurpose?: string;
}
