import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, Image, View } from 'react-native';
import { FontSize, FontFamily, Color, Border, Padding } from '../GlobalStyles';

type FloatingButtonType = {
  title?: string;
  propJustifyContent?: string;
  onPress?: () => void;
};

// Helper function to get the style value
const getStyleValue = (key: string, value: string | number | undefined) => {
  if (value === undefined) return;
  return { [key]: value === 'unset' ? undefined : value };
};

/**
 * This component is used to create a floating button with a title and an arrow
 * icon.
 *
 * @param title The title of the button, which is displayed on the button.
 * @param propJustifyContent The value for the justifyContent property of the
 * button.
 * @param onPress The function that is called when the button is pressed.
 * @returns A floating button with a title and an arrow icon.
 */
const FloatingButton = ({
  title,
  propJustifyContent,
  onPress
}: FloatingButtonType) => {
  const floatButtonStyle = useMemo(() => {
    return {
      ...getStyleValue('justifyContent', propJustifyContent)
    };
  }, [propJustifyContent]);

  return (
    <View style={[styles.floatButton, floatButtonStyle]}>
      <Pressable style={styles.pressable} onPress={onPress}>
        <Text style={styles.button}>{title}</Text>
        <Image
          style={styles.phosphorIconsArrowcirclerigh}
          resizeMode='cover'
          source={require('../assets/arrow_right.png')}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    fontSize: FontSize.size_md,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: FontFamily.sans,
    color: Color.gray,
    textAlign: 'left'
  },
  phosphorIconsArrowcirclerigh: {
    width: 24,
    height: 24
  },
  pressable: {
    alignSelf: 'stretch',
    flex: 1,
    borderRadius: Border.br_9xs,
    backgroundColor: Color.primary,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    flexDirection: 'row',
    paddingHorizontal: Padding.p_xs,
    paddingVertical: Padding.p_3xs,
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  floatButton: {
    width: 159,
    height: 60,
    padding: Padding.p_3xs,
    alignItems: 'center'
  }
});

export default FloatingButton;
