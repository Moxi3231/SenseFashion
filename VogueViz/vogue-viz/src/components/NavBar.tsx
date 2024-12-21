"use client";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";

import { useState } from "react";
import AdminLogin from "./AdminLogin";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useSession } from 'next-auth/react';
import { signOut } from "next-auth/react"

export default function NavBar() {
  const { data: session } = useSession()
  const [adminModalMode, showAdminModal] = useState(false);
  return (<>
   <Navbar
  bg="dark"
  data-bs-theme="dark"
  expand="lg"
  className="bg-body-tertiary shadow-sm py-3"
>
  <Container>
    <Navbar.Brand href="/" className="d-flex align-items-center">
      <Image
        src="/favicon.ico"
        roundedCircle
        width={30}
        height={30}
        alt="Logo"
        className="me-2"
      />
      <span className="text-white fw-bold">Vogue Viz</span>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
      <Nav className="me-auto">
        <Nav.Item>
          <Nav.Link href="/" className="text-light fw-semibold">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/viz" className="text-light fw-semibold">Visualize</Nav.Link>
        </Nav.Item>

        {/* Dropdown for session-based links */}
        {session && (
          <NavDropdown title="More Options" id="nav-dropdown" className="fw-semibold">
            <NavDropdown.Item href="/add-product-brand">Add Scrape Data</NavDropdown.Item>
            <NavDropdown.Item href="/scrape-data">Scrape Data</NavDropdown.Item>
            <NavDropdown.Item href="/scrape-ids">Scrape Single Products | From Excel</NavDropdown.Item>
            <NavDropdown.Item href="/render-single-products">Viz Single Products</NavDropdown.Item>

            <NavDropdown.Item href="/compare-and-viz">Compare & Viz</NavDropdown.Item>
          </NavDropdown>
        )}
      </Nav>

      <Nav className="d-flex align-items-center">
        <Nav.Item>
          <Nav.Link
            onClick={() => {
              showAdminModal(true);
            }}
            disabled={session?.user != undefined}
            className="text-danger fw-semibold"
          >
            Admin
          </Nav.Link>
        </Nav.Item>

        {session && (
          <NavDropdown
            title={<span className="text-success fw-semibold">{session.user?.name}</span>}
            id="user-dropdown"
            className="ms-3"
          >
            <NavDropdown.Item
              onClick={() => {
                signOut();
              }}
              className="text-danger fw-semibold"
            >
              Sign Out
            </NavDropdown.Item>
          </NavDropdown>
        )}
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>

    <Modal size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={adminModalMode} onHide={() => { showAdminModal(false) }}>
      <Modal.Body>
        <AdminLogin></AdminLogin>
      </Modal.Body>
      <Modal.Footer>
        <span className="text-muted">
          Click on the side to close
        </span>
      </Modal.Footer>
    </Modal >
  </>
  );
}
