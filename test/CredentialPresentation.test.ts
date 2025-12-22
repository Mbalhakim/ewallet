import {
  generatePresentationSubmission,
  generateVerifiablePresentation, hasIdToken
} from '../screens/VPFlow/VpUtils';
import { VcIdModel } from '../util/types/Credential';
import { PresentationDefinition } from '../util/types/PresentationDefinition';

const testCredential: VcIdModel = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  credentialSchema: {
    id: 'VC-ID Example',
    type: 'FullJsonSchemaValidator2021'
  },
  credentialSubject: {
    dateOfBirth: '2022-10-18T22:00:00.000Z',
    familyName: 'Jansen',
    firstName: 'Joop',
    gender: 'Man',
    id: '578899766',
    nameAndFamilyNameAtBirth: 'Joop, Jansen',
    personalIdentifier: '8888888889',
    placeOfBirth: 'Groningen'
  },
  id: 'urn:uuid:1bc957f1-f160-4de8-ae15-dc636c654f77',
  issuanceDate: '2023-03-21T09:21:57.939572546Z',
  issued: '2023-08-22T13:12:46.269Z',
  issuer: 'http://issuer-gemeente.westeurope.azurecontainer.io:3000',
  proof: {
    created: '2023-08-22T13:12:46.269Z',
    jws: 'eyJhbGciOiJSUzI1NiJ9..AFpb-ZbDNbFgUDHYrlSf2Kgli5I_0-O4q2BRTMOw-T-0kAynG4bcu8tXQp36j2geQ5hUD89yPn44XxrtrS9TDgnvDba9zLE7WrAwEgql-aCDAHmYL34ktRmQ1xbG2Ms5B8_690I4Yr-CaITohKDsQ3QTySW-fjRZKGOEuwVbkU_mUKmNwQvnTvn4avFt66t9sQvOJkIoXgS8Lro10gKfyDVgEbArIgVGtSl_M7oEIWiNKmazWoPpUKpyNhhGTod9Y5BsJdoniuGg2DJj6LH4PDauZ5iJHew82iElmclBqwOKQZhWFQBW8vnK3Ybl-scGkZjjECxOd9JOMGFORuPk6A',
    proofPurpose: 'assertionMethod',
    type: 'JsonWebSignature2020'
  },
  type: ['VerifiableCredential', 'VerifiableAttestation', 'VerifiableId'],
  validFrom: '2023-08-22T13:12:46.269Z'
};

const testPresentationDefinition: PresentationDefinition = {
  id: '1234',
  input_descriptors: [
    {
      id: 'id card credential',
      format: {
        ldp_vc: {
          proof_type: ['Ed25519Signature2018']
        }
      },
      constraints: {
        fields: [
          {
            path: ['$.type'],
            filter: {
              type: 'string',
              pattern: 'VerifiableId'
            }
          }
        ]
      }
    }
  ]
};

const testWithIdToken: string = 'vp_token id_token'

const testWithoutIdToken: string = 'vp_token'

jest.mock('uuid', () => ({
  v4: jest.fn(() => '123')
}));

describe('Credential Presentation', () => {
  it('Should generate a presentation submission', () => {
    const submission = generatePresentationSubmission(
      testPresentationDefinition
    );
    expect(submission).toBeDefined();
    expect(submission.id).toBe('123');
    expect(submission.definition_id).toBe(testPresentationDefinition.id);
    expect(submission.descriptor_map[0].id).toBe(
      testPresentationDefinition.input_descriptors[0].id
    );
  });
  it('Should generate a VP token', () => {
    const vpToken = generateVerifiablePresentation(
      testCredential,
      'did:testje'
    );
    expect(vpToken).toBeDefined();
    expect(vpToken.verifiableCredential[0].id).toBe(testCredential.id);
    expect(vpToken.holder).toBe('did:testje');
  });
  it('Should send true', () =>{
    const result = hasIdToken(testWithIdToken);
    expect(result).toBeDefined();
    expect(result).toBe(true);
  })
  it('Should send false', () =>{
    const result = hasIdToken(testWithoutIdToken);
    expect(result).toBeDefined();
    expect(result).toBe(false);
  })
});
