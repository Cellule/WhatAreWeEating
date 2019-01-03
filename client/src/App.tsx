import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import React, { Component } from 'react';
import NavMenu from "./NavMenu";
import { Route } from 'react-router';
import Home from "./Home";

const routes = [
  { path: '/', component: Home},
]

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavMenu />
        {routes.map(route =>
          <Route exact key={route.path} path={route.path} component={route.component} />
        )}
      </div>
    );
  }
}

export default App;
