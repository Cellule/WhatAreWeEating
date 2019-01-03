import * as React from 'react';
import Home from "./Home";
import Ingredients from "./Ingredients";
import {IProps as IconProps} from '../Icon';

class Display extends React.Component {
  public static displayName: string;
}

export const pages: {
  path: string,
  component: typeof Display,
  icon: IconProps
}[] = [
  { path: '/', component: Home, icon: {glyph: "home", library: "glyphicon"}},
  { path: '/ingredients', component: Ingredients, icon: {glyph: "carrot", library: "fa"}},
]