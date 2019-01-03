import * as React from 'react';
import {
  Glyphicon,
  Nav,
  Navbar,
  NavItem,
} from 'react-bootstrap';
import TableSorter from '../TableSorter';
import {getIngredients} from "../api";
import { Ingredient } from '../../../common/interface';

interface State {
  ingredients: Ingredient[]
  error?: Error
}

export default class Ingredients extends React.Component {
  public static displayName = Ingredients.name
  state: State = {
    ingredients: [],
  }

  public componentDidMount() {
    this.loadIngredients();
  }

  public render() {
    if (this.state.error) {
      return (<div>
        {this.state.error.message}
      </div>)
    }
    return (
      <div>
        {JSON.stringify(this.state.ingredients)}
      </div>
    );
  }

  private loadIngredients = async () => {
    try {
      const {ingredients} = await getIngredients();
      this.setState({
        ingredients
      });
    } catch (error) {
      this.setState({error})
    }
  };
}
