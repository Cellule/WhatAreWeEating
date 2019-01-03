import './App.css';
import "bootstrap/dist/css/bootstrap.css"
import "@fortawesome/fontawesome-free/css/all.css"
import React, { Component } from 'react';
import DocumentTitle from "react-document-title";
import NavMenu from "./NavMenu";
import { Route } from 'react-router';
import { pages } from "./Pages"
import { Grid } from 'react-bootstrap';

class App extends Component {
  render() {
    return (
      <DocumentTitle title="What are we eating?">
        <Grid className="Layout-content">
          <NavMenu />
          {pages.map(route =>
            <Route exact key={route.path} path={route.path} component={route.component} />
          )}
        </Grid>
      </DocumentTitle>
    );
  }
}

export default App;
