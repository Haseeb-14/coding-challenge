import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions
const baseWidth = 375; // iPhone X width
const baseHeight = 812; // iPhone X height

// Scale factors
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Responsive functions
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

export const w = (size: number): number => {
  return size * widthScale;
};

export const h = (size: number): number => {
  return size * heightScale;
};

export const normalize = (size: number): number => {
  const newSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Spacing
export const Spacing = {
  xs: w(4),
  sm: w(8),
  md: w(16),
  lg: w(24),
  xl: w(32),
  xxl: w(48),
  xxxl: w(64),
} as const;

// Border Radius
export const BorderRadius = {
  xs: w(2),
  sm: w(4),
  md: w(8),
  lg: w(12),
  xl: w(16),
  xxl: w(24),
  round: w(50),
} as const;

// Font Sizes
export const FontSize = {
  xs: normalize(10),
  sm: normalize(12),
  md: normalize(14),
  lg: normalize(16),
  xl: normalize(18),
  xxl: normalize(20),
  xxxl: normalize(24),
  title: normalize(28),
  largeTitle: normalize(34),
} as const;

// Icon Sizes
export const IconSize = {
  xs: w(12),
  sm: w(16),
  md: w(24),
  lg: w(32),
  xl: w(40),
  xxl: w(48),
} as const;

// Button Heights
export const ButtonHeight = {
  sm: h(32),
  md: h(44),
  lg: h(56),
} as const;

// Input Heights
export const InputHeight = {
  sm: h(36),
  md: h(44),
  lg: h(52),
} as const;

// Screen Dimensions
export const ScreenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
} as const;

// Header Heights
export const HeaderHeight = {
  default: h(44),
  large: h(88),
} as const;

// Tab Bar Heights
export const TabBarHeight = h(83);

// Safe Area
export const SafeArea = {
  top: h(44),
  bottom: h(34),
} as const;
