import axios from 'axios';
import { PresentationDefinition } from '../../util/types/PresentationDefinition';
import {
  InputDescriptorMap,
  PresentationSubmission
} from '../../util/types/PresentationSubmission';
import { VcIdModel } from '../../util/types/Credential';
import { v4 as uuidv4 } from 'uuid';
import { VerifiablePresentation } from '../../util/types/VerifiablePresentation';

function generatePresentationSubmission(presDef: PresentationDefinition) {
  let submission: PresentationSubmission = {} as PresentationSubmission;
  submission.id = uuidv4();
  submission.definition_id = presDef.id;
  let descriptorMap: InputDescriptorMap = {
    id: presDef.input_descriptors[0].id,
    format: 'ldp_vc',
    path: '$.verifiableCredential[0]'
  };
  submission.descriptor_map = [descriptorMap];
  return submission;
}

function generateVerifiablePresentation(vc: VcIdModel, holder: string) {
  let presentation: VerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [vc],
    id: uuidv4(),
    holder
  };
  return presentation;
}

function hasIdToken(responseType: string): boolean {
  return responseType.includes('id_token');
}

export { generatePresentationSubmission, generateVerifiablePresentation, hasIdToken };
