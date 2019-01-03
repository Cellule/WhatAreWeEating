import * as React from 'react';
import {
  Glyphicon,
  Nav,
  Navbar,
  NavItem,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import {pages} from "./Pages"
import Icon from './Icon';
//import './NavMenu.css';

export default class NavMenu extends React.Component {
  public displayName = NavMenu.name

  public render() {
    return (
      <Navbar
        inverse={true}
        fixedTop={true}
        fluid={true}
        collapseOnSelect={true}
      >
        <Navbar.Header>
          <Navbar.Brand>
            <Link to={'/'}>What Are We Eating</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
            <Nav>
          {pages.map(page =>
            <LinkContainer to={page.path} exact={true}>
              <NavItem>
                <Icon {...page.icon} /> {page.component.displayName}
              </NavItem>
            </LinkContainer>
          )}
            </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
