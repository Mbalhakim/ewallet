import { Pressable, Text, View, useColorScheme } from 'react-native';
import React, { ComponentProps } from 'react';
import '../nativewind-env.d.ts';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ComponentProps<typeof Pressable> & {
  size?: 'small' | 'regular' | 'large';
  variant?: 'primary' | 'secondary';
  text?: string;
};

export default function TailwindButton({
  size = 'regular',
  variant = 'primary',
  text,
  className,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      className={twMerge(
        `flex items-center justify-center rounded-xl px-4 py-2`,
        variant === 'primary' && 'bg-ditblue-500',
        variant === 'secondary' && 'border border-ditblue-500 bg-white'
      )}
      {...rest}
    >
      {text ? (
        <Text
          className={twMerge(
            variant === 'primary' && 'color-white',
            variant === 'secondary' && 'color-ditblue-500',
            size === 'small' && 'text-s px-2 py-1',
            size === 'regular' && 'text-l px-4 py-2',
            size === 'large' && 'px-6 py-2 font-anton text-xl'
          )}
        >
          {text}
        </Text>
      ) : (
        rest.children
      )}
    </Pressable>
  );
}
