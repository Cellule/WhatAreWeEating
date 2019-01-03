import './App.css';
import "bootstrap/dist/css/bootstrap.css"
import "@fortawesome/fontawesome-free/css/all.css"
import React, { Component } from 'react';
import NavMenu from "./NavMenu";
import { Route } from 'react-router';
import {pages} from "./Pages"

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavMenu />
        {pages.map(route =>
          <Route exact key={route.path} path={route.path} component={route.component} />
        )}
      </div>
    );
  }
}

export default App;
