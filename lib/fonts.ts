import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter-Regular',
    web: 'Inter-Regular',
    default: 'System'
  }),
  semiBold: Platform.select({
    ios: 'Inter-SemiBold',
    android: 'Inter-SemiBold',
    web: 'Inter-SemiBold',
    default: 'System'
  }),
  bold: Platform.select({
    ios: 'Inter-Bold',
    android: 'Inter-Bold',
    web: 'Inter-Bold',
    default: 'System'
  })
};