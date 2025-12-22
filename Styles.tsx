import { StyleSheet, Dimensions } from 'react-native';
import {
  FontSize,
  FontFamily,
  Color,
  Padding,
  Margin,
  Border
} from './GlobalStyles';

const { height, width } = Dimensions.get('window');
const buttonHeight = height * 0.1;
const bannerWidth = width;
const bannerHeight = bannerWidth * 0.25;

export const DLStyle = StyleSheet.create({
  bs: {
    backgroundColor: Color.dark
  },
  container: {
    flex: 1,
    width: '100%',
    height: 796,
    paddingHorizontal: Padding.p_3xs,
    paddingTop: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Color.light
  },
  h1: {
    fontSize: FontSize.size_xxl,
    lineHeight: 40,
    fontWeight: 'bold',
    fontFamily: FontFamily.sans
  },
  h2: {
    fontSize: FontSize.size_xl,
    lineHeight: 32,
    fontWeight: 'bold',
    fontFamily: FontFamily.sans
  },
  h3: {
    fontSize: FontSize.size_lg,
    lineHeight: 24,
    fontWeight: 'bold',
    fontFamily: FontFamily.sans
  },
  h4: {
    fontSize: FontSize.size_md,
    lineHeight: 22,
    fontWeight: 'bold',
    fontFamily: FontFamily.sans
  },
  body: {
    fontSize: FontSize.size_md,
    lineHeight: 20,
    fontWeight: 'normal',
    fontFamily: FontFamily.sans
  },
  emphasis: {
    fontSize: FontSize.size_md,
    lineHeight: 20,
    fontWeight: 'bold',
    fontFamily: FontFamily.sans
  },
  buttonContainer: {
    /* This is the responsive container that holds several vertical buttons */
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuButton: {
    marginBottom: Margin.m_6xs,
    height: buttonHeight,
    borderRadius: Border.br_lg,
    backgroundColor: Color.secondary,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: FontSize.size_xl,
    fontWeight: 'bold'
  },
  buttonListContainer: {
    flex: 1,
    width: width * 0.9 // 90% of screen width
  },
  menuListView: {
    alignItems: 'center',
    height: width * 0.7, // 55% of screen width
    width: width * 0.9 // 90% of screen width
  },
  qrView: {
    height: width * 0.22, // 55% of screen width
    width: width * 0.9 // 90% of screen width
  },
  banner: {
    backgroundColor: Color.light
  },
  bannerIcon: {
    resizeMode: 'contain',
    width: bannerWidth,
    height: bannerHeight
  },
  bannerView: {
    alignSelf: 'stretch',
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
