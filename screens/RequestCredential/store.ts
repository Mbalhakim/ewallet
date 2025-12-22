import { produce } from 'immer';
import { create } from 'zustand';
import { createBoundedUseStore } from '../../util/ZustandUtils';
import { Issuer } from '.';

interface RequestCredentialState {
  issuers: Issuer[];
  credentialTypes: string[];
  selectedIssuer: number;
  selectedType: number;
  sessionId: string;
  setSelectedIssuer: (selected: number) => void;
  setSelectedType: (selected: number) => void;
  setSessionId: (id: string) => void;
}

const useCredentialRequestStore = create<RequestCredentialState>()((set) => ({

  credentialTypes: ['VerifiableId', 'Diploma'],
  issuers: [
    {
      name: 'Gemeente Woningen',
      supportedCredentialTypes: ['VerifiableId'],
      requestUrl: 'https://gemeente.ditlab.cloud/same-device-request',
      baseUrl: 'https://gemeente.ditlab.cloud'
    },
    {
      name: 'DUO',
      supportedCredentialTypes: ['Diploma'],
      requestUrl: 'https://gemeente.ditlab.cloud/same-device-request',
      baseUrl: 'https://gemeente.ditlab.cloud'
    }
  ],
  selectedIssuer: -1,
  selectedType: -1,
  sessionId: '',
  setSelectedIssuer: (selected) =>
    set(
      produce((state) => {
        state.selectedIssuer = selected;
      })
    ),
  setSelectedType: (selected) =>
    set(
      produce((state) => {
        state.selectedType = selected;
      })
    ),
  setSessionId: (id) =>
    set(
      produce((state) => {
        state.sessionId = id;
      })
    )
}));

export default createBoundedUseStore(useCredentialRequestStore);
