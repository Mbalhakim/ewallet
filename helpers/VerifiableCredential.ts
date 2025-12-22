interface Proof {
  created: string;
  jws: string;
  proofPurpose: string;
  type: string;
}

interface CredentialSubject {
  dateOfBirth: string;
  familyName: string;
  firstName: string;
  gender: string;
  id: string;
  nameAndFamilyNameAtBirth: string;
  personalIdentifier: string;
  placeOfBirth: string;
}

interface Credential {
  '@context': string[];
  credentialSchema: {
    id: string;
    type: string;
  };
  credentialSubject: CredentialSubject;
  id: string;
  issuanceDate: string;
  issued: string;
  issuer: string;
  proof: Proof;
  type: string[];
  validFrom: string;
}

export interface VerifiableCredential {
  [key: string]: Credential;
}

const example: VerifiableCredential = {
  '2023-09-05T08:56:12.644Z': {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    credentialSchema: {
      id: 'VC-ID',
      type: 'FullJsonSchemaValidator2021'
    },
    credentialSubject: {
      dateOfBirth: '2022-10-18T22:00:00.000Z',
      familyName: 'Pan888',
      firstName: 'Yyyyyyyuy888',
      gender: 'Ja888',
      id: '',
      nameAndFamilyNameAtBirth: 'Pan888, Yyyyyyyuy888',
      personalIdentifier: '',
      placeOfBirth: 'Groningen888'
    },
    id: 'urn:uuid:1bc957f1-f160-4de8-ae15-dc636c654f77',
    issuanceDate: '2023-03-21T09:21:57.939572546Z',
    issued: '2023-09-05T08:56:12.644Z',
    issuer: 'http://issuer-gemeente.westeurope.azurecontainer.io:3000',
    proof: {
      created: '2023-09-05T08:56:12.644Z',
      jws: 'eyJhbGciOiJSUzI1NiJ9..yOoQEq44r5cBybdbtZYN_th-HtmgM1_ipxCz2uAHBUYl37JdbKwdMNDibhA0SOpomrWw1NbNVQ9BY3tiUustntegt5hWgopeLaMylWpBnS5bJKR9DFloG6j2E8aL_c2nPFRyWbDkdhpvXZH3JnguNKGgpC7JBJ_8nPjPDVU65PLgp9Z_Q3ElXLlqjMEH2m7CE-kGXog8wZzbp5LIaga5zj0PHKMj0oE5sC_fhsLE6dGNmwbN4qKd-HTsFfzrrtT6CHT3v9hjXPPNOB-efRRRD8KJ88w71D28wvQ4GzmR-A-xxW77LGDH2iQLuL9HA6ntNesnsGkqqWk0Tj7hqfENrA',
      proofPurpose: 'assertionMethod',
      type: 'JsonWebSignature2020'
    },
    type: ['VerifiableCredential', 'VerifiableAttestation', 'VerifiableId'],
    validFrom: '2023-09-05T08:56:12.644Z'
  }
};
