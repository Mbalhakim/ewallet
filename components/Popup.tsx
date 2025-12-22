import { Modal, View, Text, Pressable } from 'react-native';
import '../nativewind-env.d.ts';
import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import TailwindButton from './TailwindButton';

type PopupProps = {
  onAccept: () => void;
  onReject?: () => void;
  acceptText: string;
  rejectText?: string;
  title: string;
  bodyText?: string;
};

type PopupContextType = {
  popupVisible: boolean;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const PopupContext = createContext<PopupContextType>({
  popupVisible: false,
  setPopupVisible: () => {}
});

function Slot({
  children,
  onPress
}: {
  children?: React.ReactNode;
  onPress: () => void;
}) {
  if (React.Children.count(children) > 1) {
    throw new Error('Slot only supports 1 child component');
  }

  if (React.isValidElement(children)) {
    return React.cloneElement(children, { onPress }, null);
  }

  return null;
}

const Popup = ({ children, ...restProps }: { children: React.ReactNode }) => {
  const [popupVisible, setPopupVisible] = useState(false);

  return (
    <PopupContext.Provider
      value={{ popupVisible, setPopupVisible }}
      {...restProps}
    >
      {children}
    </PopupContext.Provider>
  );
};

const PopupTrigger = ({
  children,
  asChild = false
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : Pressable;
  const { setPopupVisible } = useContext(PopupContext);

  return <Comp onPress={() => setPopupVisible(true)}>{children}</Comp>;
};

const PopupBody = ({
  acceptText,
  rejectText,
  onAccept,
  onReject,
  title,
  bodyText
}: PopupProps) => {
  const { popupVisible, setPopupVisible } = useContext(PopupContext);

  return (
    <Modal animationType='fade' transparent={true} visible={popupVisible}>
      <View className='flex h-full w-full items-center justify-center'>
        <View className='flex-column flex w-72 items-center justify-center rounded-lg border-2 border-solid border-ditblue-700 bg-gray-50 px-2 py-4'>
          <Text className='color-ditblue-800 mb-2 text-lg font-bold'>
            {title}
          </Text>
          {bodyText && <Text className='mb-3 text-center'>{bodyText}</Text>}
          <View className='flex flex-row items-center justify-center gap-2'>
            {rejectText && (
              <TailwindButton
                text={rejectText}
                onPress={() => {
                  if (onReject) {
                    onReject();
                  }
                  setPopupVisible(false);
                }}
              />
            )}
            <TailwindButton
              variant='secondary'
              text={acceptText}
              onPress={() => {
                onAccept();
                setPopupVisible(false);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

Popup.Trigger = PopupTrigger;
Popup.Body = PopupBody;

export default Popup;
