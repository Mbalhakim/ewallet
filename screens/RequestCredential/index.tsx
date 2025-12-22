import React from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import StepperDialog from '../../components/StepperDialog';
import SelectCredentialType from './SelectCredentialType';
import SelectIssuer from './SelectIssuer';
import Browser from './Browser';
import { Text } from 'react-native';
import Routing from './Routing';
import SaveCredential from './SaveCredential';
import { useNavBar } from '../../context/NavProvider';

export interface Issuer {
  name: string;
  supportedCredentialTypes: string[];
  requestUrl: string;
  baseUrl: string;
}

const RequestCredentialDialog = ({ route }) => {
  const [visible, setVisbile] = useState(true);
  const navigation = useNavigation();
  const { setNavBarShown } = useNavBar();
  const {
    params: { credential_offer_uri }
  } = route;

  useFocusEffect(() => {
    setNavBarShown(false);
    setVisbile(true);
  });

  return (
    <StepperDialog
      visible={visible}
      steps={[
        { title: 'Select credential type', showInHeader: true },
        { title: 'Select credential issuer', showInHeader: true },
        { title: 'Browser', showInHeader: false },
        { title: 'Receive credential', showInHeader: true }
      ]}
      setVisibility={(state) => {
        setVisbile(state);
      }}
      // The in app browser doesn't seem to play nice with the modal
      useModal={false}
    >
      <StepperDialog.Step step={0} component={<SelectCredentialType />} />
      <StepperDialog.Step step={1} component={<SelectIssuer />} />
      <StepperDialog.Step
        step={2}
        component={<Browser offerUri={credential_offer_uri} />}
        noHeader
      />
      <StepperDialog.Step
        step={3}
        component={<SaveCredential offerUri={credential_offer_uri} />}
      />
    </StepperDialog>
  );
};

export default RequestCredentialDialog;
