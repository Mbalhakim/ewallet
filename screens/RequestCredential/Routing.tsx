import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { useStepperDialogContext } from '../../components/StepperDialog';

type Props = {
  offerUri: string;
};

const Routing = ({ offerUri: consentUri }: Props) => {
  const { setStep } = useStepperDialogContext();

  useEffect(() => {
    if (consentUri) {
      setStep(3);
    }
  });
  return <></>;
};

export default Routing;
