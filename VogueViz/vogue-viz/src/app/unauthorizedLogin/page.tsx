"use client";
import React from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';

function UnauthorizedLogin() {
  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-items-center h-100 d-block">
        <Col xs={12} md={6} lg={4} className='w-75 m-auto'>
          <Card className="text-center shadow-sm">
            <Card.Header as="h4" className="bg-danger text-white">
              Unauthorized Login!
            </Card.Header>
            <Card.Body>
              <Card.Text className='text-muted'>
              You do not have the necessary permissions to access this page. Please ensure you're logged in with the correct credentials to gain access. If you need administrative privileges, please log in by clicking on the 'Admin' option located in the NavBar.
              </Card.Text>
      
              <div className='d-block'>
                <Nav.Link href="/" className='btn btn-outline-light btn-lg'>Take Me Home</Nav.Link>
              </div>
              
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UnauthorizedLogin;
