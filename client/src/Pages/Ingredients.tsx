import * as React from 'react';
import {
  Glyphicon,
  Nav,
  Navbar,
  NavItem,
  Row,
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
    const content = this.state.error
    ? (<div>{this.state.error.message}</div>)
    : (<div>{JSON.stringify(this.state.ingredients)}</div>)
    return (
      <Row>
        <h1>Ingredients</h1>
        {content}
      </Row>
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
