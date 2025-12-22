import * as React from 'react';
import {
  View,
  SafeAreaView,
  StyleProp,
  ViewStyle,
  ImageBackground,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { DLStyle } from '../Styles';

type BannerType = {
  style?: StyleProp<ViewStyle>;
};

/**
 * This component is used to display the DIT-Lab banner on all screens.
 */
const Banner = ({ style }: BannerType) => {
  const navigation = useNavigation();
  const navToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    //<SafeAreaView style={[DLStyle.banner, style]}>
    <SafeAreaView className='mr-16'>
      <Pressable onPress={() => navToScreen('HomeScreen')}>
        <View style={DLStyle.bannerView}>
          <ImageBackground
            style={DLStyle.bannerIcon}
            resizeMode='cover'
            source={require('../assets/banner.png')}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default Banner;
