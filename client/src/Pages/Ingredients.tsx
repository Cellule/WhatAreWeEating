import * as React from 'react';
import {
  Glyphicon,
  Nav,
  Navbar,
  NavItem,
  Row,
} from 'react-bootstrap';
import TableSorter from '../Components/TableSorter';
import { getIngredients } from "../api";
import { Ingredient } from '../../../common/interface';
import Loading from '../Components/Loading';
import CancellablePromise from '../CancellablePromise';

interface State {
  ingredients: Ingredient[]
}

export default class Ingredients extends React.Component {
  public static displayName = Ingredients.name
  state: State = {
    ingredients: [],
  }

  public render() {
    return (
      <Row>
        <h1>Ingredients</h1>
        <Loading load={this.loadIngredients} render={this.renderIngredientTable}/>
      </Row>
    );
  }

  private renderIngredientTable = () => {
    return <TableSorter
      config={{
        defaultOrdering: ["name"],
        sort: { column: "name", order: "asc" },
        columns: {
          name: {
            name: "Name"
          }
        }
      }}
      items={this.state.ingredients}
    />
  }

  private loadIngredients = async (cancel: CancellablePromise<void>) => {
    const { ingredients } = await getIngredients();
    if (!cancel.isCancelled) {
      this.setState({
        ingredients
      });
    }
  };
}
