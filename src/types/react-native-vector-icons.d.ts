declare module 'react-native-vector-icons/MaterialIcons' {
  import {Component} from 'react';
  import {TextStyle} from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    onPress?: () => void;
  }

  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import {Component} from 'react';
  import {TextStyle} from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    onPress?: () => void;
  }

  export default class Icon extends Component<IconProps> {}
}