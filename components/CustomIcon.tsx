import React from 'react';
import {
  View,
  SafeAreaView,
  StyleProp,
  ViewStyle,
  ImageBackground
} from 'react-native';
import icon from "../assets/credentialsIcon2.svg"


const CustomIcon = () => {
  return (
    <SafeAreaView>
      <View>
        <ImageBackground
          source={icon}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomIcon;
