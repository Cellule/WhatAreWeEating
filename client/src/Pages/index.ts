import * as React from 'react';
import Home from "./Home";
import Ingredients from "./Ingredients";

class Display extends React.Component {
  public static displayName: string;
}

export const pages: {
  path: string,
  component: typeof Display
}[] = [
  { path: '/', component: Home},
  { path: '/ingredients', component: Ingredients},
]