// Ambient type shim for @react-navigation/native-stack.
// Used only while the package is not yet installed; once `npm install`
// runs, the real types from node_modules take precedence over this file.
import type {
  NavigatorType,
  Route,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import type { ComponentType } from 'react';

export interface NativeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string,
> extends NavigationProp<ParamList, RouteName> {}

export interface NativeStackScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string,
> {
  navigation: NativeStackNavigationProp<ParamList, RouteName>;
  route: Route<string>;
}

export function createNativeStackNavigator<ParamList extends ParamListBase>(): {
  Navigator: ComponentType<any>;
  Screen: ComponentType<any>;
  Group: ComponentType<any>;
} {
  throw new Error('native-stack not installed');
}