import * as React from 'react';
import { Pressable, StyleProp, ViewStyle, Text } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DLStyle } from '../Styles';

type MenuButtonType = {
  style?: StyleProp<ViewStyle>;
  buttonLabel: string;
  screenName: string;
  credential: any;
};

/**
 * This component is used to display a button.
 */
const MenuButton = ({
  buttonLabel,
  screenName,
  credential
}: MenuButtonType) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <Pressable
      style={DLStyle.menuButton}
      onPress={() =>
        navigation.navigate(screenName, { credential: { credential } })
      }
    >
      <Text style={DLStyle.buttonLabel}>{buttonLabel}</Text>
    </Pressable>
  );
};

export default MenuButton;
