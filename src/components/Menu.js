import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { auth } from "../firebase";
import { Link, useLocation } from "react-router-dom";

const Menu = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }

    if (localStorage.getItem("isAdmin")) {
      setIsAdmin(true);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("accessToken");
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!isAuth) {
    return;
  }

  return (
    <Navbar bg="light" expand="lg" className="w-100 mx-0 px-0 mb-3">
      <Container className="py-3">
        <Navbar.Brand as={Link} to="/">
          Home
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAdmin && (
              <Nav.Link as={Link} to="/chat">
                Chat
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/settings">
                Settings
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to='/alerts'>
                Alerts
              </Nav.Link>
            )}
          </Nav>
          <Button
            variant="outline-primary"
            className="ml-auto"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Menu;
