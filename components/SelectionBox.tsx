import React from 'react';
import { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface Props {
  selections: string[];
  onSelectionPress: (index: number) => void;
}

const SelectionBox = ({ selections, onSelectionPress }: Props) => {
  const [selected, setSelected] = useState(-1);

  return (
    <View className='flex w-48 flex-col items-stretch justify-center rounded-md bg-gray-100 py-4'>
      {selections.map((credentialType, index) => (
        <Pressable
          onPress={() => {
            onSelectionPress(index);
            setSelected(index);
          }}
          key={index}
        >
          <View
            className={twMerge(
              'w-full p-2',
              selected === index && 'bg-ditblue-500'
            )}
          >
            <Text
              className={twMerge(
                'color-slate-800 text-md text-center',
                selected === index && 'text-gray-200'
              )}
            >
              {credentialType}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default SelectionBox;
