import { create } from 'zustand';
import { produce } from 'immer';
import { createBoundedUseStore } from '../../util/ZustandUtils';
import { PresentationDefinition } from '../../util/types/PresentationDefinition';
import { VcIdModel } from '../../util/types/Credential';

interface VPState {
  clientId: string;
  state: string,
  nonce: string,
  requestUri: string;
  responseUri: string;
  responseType: string;
  presentationDefinition?: PresentationDefinition;
  selectedVcs: string[];
  setClientId: (clientId: string) => void;
  setState: (siopState: string) => void;
  setNonce: (nonce: string) => void;
  setRequestUri: (requestUri: string) => void;
  setPresentationDefinition: (
    presentationDefinition: PresentationDefinition
  ) => void;
  addSelectedVc: (id: string) => void;
  setSelectedVcs: (ids: string[]) => void;
  toggleSelected: (id: string) => void;
  setResponseUri: (uri: string) => void;
  setResponseType: (type: string) => void;
  status: 'success' | 'failure';
  errorMessage: string;
  setSuccess: () => void;
  setFailure: () => void;
  setErrorMessage: (message: string) => void;
}

const useVPStore = create<VPState>()((set) => ({
  clientId: '',
  state: '',
  nonce: '',
  requestUri: '',
  selectedVcs: [],
  responseUri: '',
  responseType: '',
  status: 'success',
  errorMessage: '',
  setClientId: (clientId: string) =>
    set(
      produce((state) => {
        state.clientId = clientId;
      })
    ),
  setState: (siopState: string) =>
    set(
      produce((state) => {
        state.state = siopState;
      })
    ),
  setNonce: (nonce: string) =>
    set(
      produce((state) => {
        state.nonce = nonce;
      })
    ),
  setRequestUri: (requestUri: string) =>
    set(
      produce((state) => {
        state.requestUri = requestUri;
      })
    ),
  setPresentationDefinition: (presentationDefinition: PresentationDefinition) =>
    set(
      produce((state) => {
        state.presentationDefinition = presentationDefinition;
      })
    ),
  addSelectedVc: (id) =>
    set(
      produce((state) => {
        state.selectedVcs.push(id);
      })
    ),
  setSelectedVcs: (ids) =>
    set(
      produce((state) => {
        state.selectedVcs = ids;
      })
    ),
  toggleSelected: (id) => {
    set(
      produce((state) => {
        if (state.selectedVcs.includes(id)) {
          state.selectedVcs = state.selectedVcs.filter((curId) => curId != id);
        } else {
          state.selectedVcs.push(id);
        }
      })
    );
  },
  setResponseUri: (uri) => {
    set(
      produce((state) => {
        state.responseUri = uri;
      })
    );
  },
  setResponseType: (type) => {
    set(
      produce((state) => {
        state.responseType = type;
      })
    );
  },
  setSuccess: () => {
    set(
      produce((state) => {
        state.status = 'success';
      })
    );
  },
  setFailure: () => {
    set(
      produce((state) => {
        state.status = 'failure';
      })
    );
  },
  setErrorMessage: (message) => {
    set(
      produce((state) => {
        state.errorMessage = message;
      })
    );
  }
}));

export default createBoundedUseStore(useVPStore);
