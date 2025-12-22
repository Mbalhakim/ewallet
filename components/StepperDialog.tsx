import React, {
  createContext,
  useContext,
  useState,
  Fragment,
  useRef,
  useEffect
} from 'react';
import { Modal, View, Text } from 'react-native';
import '../nativewind-env.d.ts';
import StepperStepLogo2 from '../assets/stepper - 4.svg';

interface Step {
  title?: string;
  showInHeader: boolean;
}

type StepperDialogProps = {
  visible: boolean;
  steps: Step[];
  setVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  useModal?: Boolean;
};

type StepperContextType = {
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  steps: Step[];
};

const StepperDialogContext = createContext<StepperContextType>({
  currentStep: 0,
  nextStep: () => {},
  previousStep: () => {},
  setStep: () => {},
  setVisibility: () => {},
  steps: []
});

const StepperDialog = ({
  visible,
  steps,
  setVisibility,
  children,
  useModal = true
}: StepperDialogProps) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const previousStep = () => {
    if (currentStep >= 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <StepperDialogContext.Provider
      value={{
        currentStep,
        nextStep,
        previousStep,
        setStep: setCurrentStep,
        setVisibility,
        steps
      }}
    >
      {useModal ? (
        <Modal animationType='slide' transparent={true} visible={visible}>
          <View className='flex h-full flex-col justify-center bg-gray-200 p-4'>
            {children}
          </View>
        </Modal>
      ) : (
        <View className='flex h-full flex-col justify-center bg-gray-200 p-4'>
          {children}
        </View>
      )}
    </StepperDialogContext.Provider>
  );
};

const StepperDialogHeader = () => {
  const { steps, currentStep } = useContext(StepperDialogContext);

  return (
    <View className='mb-2 flex flex-row justify-between'>
      <View className='flex items-center justify-center'>
        <Text className='absolute'>
          {currentStep + 1}/{steps.length}
        </Text>
        <StepperStepLogo2 fill='#0F4274'></StepperStepLogo2>
      </View>
      <View>{/* setProgress(50); */}</View>
      <View>
        <View className='flex flex-1 flex-col items-end justify-center'>
          <Text className='color-ditblue-500 font-anton text-xl'>
            {steps[currentStep].title}
          </Text>
          {currentStep + 1 < steps.length && (
            <Text>Next Step: {steps[currentStep + 1].title}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const StepperDialogStep = ({
  step,
  component,
  noHeader = false
}: {
  step: string | number;
  component: React.ReactNode;
  noHeader?: boolean;
}) => {
  const { currentStep } = useContext(StepperDialogContext);
  if (currentStep == step) {
    return (
      <>
        {!noHeader && <StepperDialogHeader />}
        {component}
      </>
    );
  }
};

const StepperDialogSteps = ({ children }: { children: React.ReactNode }) => {
  return <View className='flex-1'>{children}</View>;
};

export const useStepperDialogContext = () => {
  const stepperDialogContext = useContext(StepperDialogContext);
  return stepperDialogContext;
};

StepperDialog.Header = StepperDialogHeader;
StepperDialog.Step = StepperDialogStep;
StepperDialog.Steps = StepperDialogSteps;

export default StepperDialog;
