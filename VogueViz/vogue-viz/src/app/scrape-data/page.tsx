"use client";
import { useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'

export default function scrapeData() {
    const { data: session,status } = useSession();

    if(status=="unauthenticated"){
        redirect('/unauthorizedLogin');
    }

    const [isEnabled, setIsEnabled] = useState(false);
    const submitFunc = async () => {
        setIsEnabled(true);
        const resp = await fetch('/api/scrapeNewIds', { method: 'POST', body: JSON.stringify({ "API_CALL_VALID": true }) }).then(res => res.json());
        if(resp.scrapeDone)
            setIsEnabled(false);
    };
    const dbInitAndValidate = async () => {
        setIsEnabled(true);
        const resp = await fetch('/api/validateOrInit',{method:'POST', body: JSON.stringify({ "API_CALL_VALID": true }) }).then(res => res.json()).finally(()=>{
            setIsEnabled(false);
        });
    };
    return (<Container className="shadow-sm mt-5 p-5 bg-white rounded">
        <Card className="border-0">
            <Card.Body>
                <div className="w-50 d-grid m-auto">
                    <Button
                        onClick={() => {
                            submitFunc();
                        }}
                        className="mb-3"
                        variant="primary"
                        disabled={isEnabled}
                        size="lg"
                    >
                        Start Scrape
                    </Button>

                    <Button
                        onClick={() => {
                            dbInitAndValidate();
                        }}
                        className="mb-3"
                        variant="primary"
                        disabled={isEnabled}
                        size="lg"
                    >
                        Intialize Database or Validate Data
                    </Button>
                </div>

            </Card.Body>
        </Card>
    </Container>)
}