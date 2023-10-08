"use client";
import React, { useState, useContext } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

import { signIn } from "next-auth/react"



import NotificationBarData from "@/components/NotificationBarData";
import LayoutContext from "@/components/LayoutContext";

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const nBarDat: NotificationBarData = useContext(LayoutContext).nbardata!;
  const handleLogin = async () => {
    const r = await signIn("credentials", { username: username, password: password });
    console.log(r);
    
  };

  return (

    <Card className="text-center border-0 shadow-sm w-100 m-auto">
      <Card.Header className='bg-dark text-white'>Admin Login</Card.Header>
      <Card.Body>
        <Form method='POST' action={'/api/auth/callback/credentials'}>
          <Form.Group className="mb-4" controlId="adminUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="adminPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="light" className='text-dark' onClick={handleLogin}>
            Login
          </Button>
        </Form>
      </Card.Body>
    </Card>

  );
}

export default AdminLogin;
