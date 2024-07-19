import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useHistory } from 'react-router-dom';
import Cookies from "js-cookie";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"

function CollapsibleExample() {

  const history = useHistory();

  const onClickLogout = ()=>{
    Cookies.remove("token");
    history.push('/');

  }
  return (
    <Navbar collapseOnSelect expand="lg" className="navbar-custom">
      <Container>
       <h1 className='logo'>To Do</h1>
        <Navbar.Toggle  aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/home" >Home</Nav.Link>
            <Nav.Link href="/archived" >Archived</Nav.Link>
            <Nav.Link href="/trashed" >Trash</Nav.Link>
            <Nav.Link href="/reminders" >Reminders</Nav.Link>
            <Nav.Link onClick={onClickLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CollapsibleExample;
