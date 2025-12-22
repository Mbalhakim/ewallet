import { CredentialProofModel, VcIdModel } from './Credential';

export interface VerifiablePresentation {
  '@context': string[];
  type: string[];
  verifiableCredential: VcIdModel[];
  id: string;
  holder: string;
  proof?: CredentialProofModel;
}
