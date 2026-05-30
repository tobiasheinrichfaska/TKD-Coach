/**
 * Shared navigation prop types.
 *
 * React Navigation v7 emits screen props with a NavigationProp + RouteProp pair.
 * We keep these intentionally loose (no per-route ParamList yet) but typed enough
 * that `navigation.navigate(...)` and `route.params?.x` are no longer `any`.
 */
import type { RouteProp, NavigationProp, ParamListBase } from '@react-navigation/native';

export type ScreenNavigationProp = NavigationProp<ParamListBase>;
export type ScreenRouteProp = RouteProp<ParamListBase, string>;

export interface ScreenProps {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
}
