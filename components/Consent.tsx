import * as React from 'react';
import { Text, View, Dimensions } from 'react-native';

import { useNavBar } from '../context/NavProvider.tsx';
import TailwindButton from './TailwindButton.tsx';

type ConsentProps = {
  title: string;
  activity: string;
  onAccept: () => void;
  onReject: () => void;
}

const Consent = ({ title, activity, onAccept, onReject }: ConsentProps) => {
  const { navBarShown, setNavBarShown } = useNavBar();

  React.useEffect(() => {
    setNavBarShown(false);
  }, []);

  return (
    <View className='flex flex-1 flex-col justify-between py-4 px-4'>
      <View className='flex-1 flex-col py-2 bg-gray-300 rounded-md'>
        <Text className='text-black text-xl mt-12 font-bold text-center'>{title}</Text>
        <Text className='text-black text-xl mt-6 text-center'>is requesting to</Text>
        <Text className='text-black text-xl mt-6 font-bold text-center'>{activity}</Text>
        <Text className='text-black text-xl mt-6 text-center'>Do you Accept?</Text>
      </View>
      <View className='pt-4 flex flex-row items-center justify-center gap-8'>
        <TailwindButton
          className='shadow-md shadow-ditblue-800'
          size='large'
          text='Reject'
          variant='secondary'
          onPress={onReject}
        />
        <TailwindButton
          className='shadow-md shadow-ditblue-800'
          size='large'
          text='Accept'
          variant='primary'
          onPress={onAccept}
        />
      </View>
    </View>
  );
};

export default Consent;