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
      className="bg-body-tertiary"
    >
      <Container>
        <Navbar.Brand href="/">
          <Image
            src="/favicon.ico"
            roundedCircle
            width={30}
            height={30}
          ></Image>{" "}
          Vogue Viz
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">

    <Nav className="mr-auto">
        <Nav.Item>
            <Nav.Link href="/" className="text-primary font-weight-bold">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link href="/viz" className="text-primary font-weight-bold">Visualize</Nav.Link>
        </Nav.Item>
        {session && (
            <>
                <Nav.Item>
                    <Nav.Link href="/add-product-brand" className="text-info font-weight-bold">Add Scrape Data</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/scrape-data" className="text-info font-weight-bold">Scrape Data</Nav.Link>
                </Nav.Item>
            </>
        )}
        <Nav.Item>
            <Nav.Link onClick={() => { showAdminModal(true); }} disabled={session?.user != undefined} className="text-danger font-weight-bold">Admin</Nav.Link>
        </Nav.Item>
    </Nav>

    {session && (
        <>
            <NavDropdown className="text-success font-weight-bold" title={"Signed In as: ".concat(session.user?.name!)} id="d1">
                <NavDropdown.Item onClick={() => { signOut(); }} className="text-danger">Sign Out</NavDropdown.Item>
            </NavDropdown>
        </>
    )}
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
