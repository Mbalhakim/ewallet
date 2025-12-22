import React from 'react';
import { View } from 'react-native';
import '../nativewind-env.d.ts';

const HomeContainer = ({
  children,
  ...restprops
}: {
  children: React.ReactNode;
}) => {
  return (
    <View
      className='flex h-full flex-col gap-2 bg-gray-100 px-4 pt-2'
      {...restprops}
    >
      {children}
    </View>
  );
};

const HomeContainerHeader = ({
  children,
  ...restprops
}: {
  children: React.ReactNode;
}) => {
  return (
    <View className='flex flex-row justify-between ' {...restprops}>
      {children}
    </View>
  );
};

const HomeContainerBody = ({
  children,
  ...restprops
}: {
  children: React.ReactNode;
}) => {
  return (
    <View
      className='flex flex-1 overflow-hidden rounded-md bg-gray-300 px-2 py-3 shadow-md shadow-ditblue-500'
      {...restprops}
    >
      {children}
    </View>
  );
};

const HomeContainerActions = ({
  children,
  ...restprops
}: {
  children: React.ReactNode;
}) => {
  return (
    <View className='flex flex-col items-stretch justify-center' {...restprops}>
      {children}
    </View>
  );
};

HomeContainer.Body = HomeContainerBody;
HomeContainer.Header = HomeContainerHeader;
HomeContainer.Actions = HomeContainerActions;

export default HomeContainer;
