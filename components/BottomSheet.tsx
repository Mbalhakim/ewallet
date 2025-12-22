import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react';
import { Modal, Pressable, View } from 'react-native';
import '../nativewind-env.d.ts';

type ThemeContextType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const MenuContext = createContext<ThemeContextType>({
  open: false,
  setOpen: () => { }
});
const BottomSheet = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

const BottomSheetTrigger = ({ children }: { children: React.ReactNode }) => {
  const menu = useContext(MenuContext);
  return (
    <Pressable onPress={() => menu.setOpen(!menu.open)}>{children}</Pressable>
  );
};

const BottomSheetContent = ({ children }: { children: React.ReactNode }) => {
  const menu = useContext(MenuContext);

  return (
    <Modal
      animationType='slide'
      visible={menu.open}
      onRequestClose={() => menu.setOpen(false)}
      transparent={true}
    >
      <View className='flex h-full w-full flex-col items-center justify-end'>
        <View className='absolute h-full w-full bg-ditblue-700 opacity-50'></View>
        <View className='grounded-t-2xl flex flex-col items-center justify-center self-stretch rounded-t-lg bg-slate-700 py-4'>
          <View className='flex flex-col gap-3'>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

BottomSheet.Trigger = BottomSheetTrigger;
BottomSheet.Content = BottomSheetContent;

export default BottomSheet;
