"use client";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import ScrapeSource from "@/components/Models/ScrapeSource";
import NotificationBarData from "@/components/NotificationBarData";
import LayoutContext from "@/components/LayoutContext";
import { useSession } from 'next-auth/react'

export default function AddProductBrand() {
    const { data: session, status } = useSession();

    if (status == "unauthenticated") {
        redirect('/unauthorizedLogin')
    }
    const productBrandData = {
        "DRESSES": {
            "url": "/dresses?f=Brand%3A",
            "brands": ["SASSAFRAS"]
        },
        "CategoryName2": {
            "url": "url_prefix_here",
            "brands": ["brandname1", "brandname2"]
        }
    };
    const [modalShowFlag, setModalShowFlag] = useState(false);
    const scrapeSource = new ScrapeSource();
    const nBarDat: NotificationBarData = useContext(LayoutContext).nbardata!;

    const [listOfScrapeSource, setListOfScrapeSources] = useState([]);
    const [scrapeConfig, setScrapeConfig] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            const resp = await ScrapeSource.fetchScrapeSources();
            setListOfScrapeSources(resp.data);
        }
        fetchData();
    })
    return (
        <>
            <Modal show={modalShowFlag} onHide={() => setModalShowFlag(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Data Source</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid>
                        <Form.Label className="font-weight-bold text-dark mb-2">Enter Source</Form.Label>
                        <Row className="align-items-center">
                            <Col xs={8} className="pr-2">
                                <Form.Control type="text"
                                    value={scrapeSource.scrapeSourceName.toString()}
                                    onChange={(event) => scrapeSource.setScrapeSourceName(event.target.value)}
                                    placeholder="Enter source" className="rounded" />
                            </Col>
                            <Col xs={4}>
                                <Button variant="primary" className="rounded py-2 w-100" onClick={async () => {
                                    if (await scrapeSource.validateAndInsert()) {
                                        nBarDat.setData("Data Inserted");

                                    } else {
                                        nBarDat.setData("Couldn't Insert Data.");
                                    }
                                    nBarDat.setShowFlag(true);
                                }}>Add</Button>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>

            <div className="container mt-4">
                <Card className="shadow-lg border-0 rounded-lg">
                    <Card.Header className="text-center bg-light py-4 rounded-top">
                        <Card.Title className="mb-0 h4 text-dark">Data Updation Portal</Card.Title>
                    </Card.Header>
                    <Card.Body className="px-5 py-4">
                        <Form onSubmit={async (event) => {
                            event.preventDefault();
                            try {
                                const data = JSON.parse(scrapeConfig);
                                const resp = await fetch('/api/updateScrapeSourceData', {
                                    method: "POST", headers: {
                                        "Content-Type": "application/json",
                                    }, body: JSON.stringify({ scrape_source: scrapeSource.scrapeSourceName, data: data })
                                }).then(res => res.json());
                                if (resp.dataUpdated) {
                                    nBarDat.setData("Updated Data");
                                    scrapeSource.setScrapeSourceName("");
                                }
                            } catch (exception) {
                                console.error(exception);
                                nBarDat.setData("Error Updating Data. Check Console Logs");
                            } finally {
                                nBarDat.setShowFlag(true);
                            }
                        }}>
                            <Form.Group className="mb-4" controlId="scrapeSource">
                                <Form.Label className="font-weight-bold text-dark mb-2">Data Source</Form.Label>
                                <div className="d-flex justify-content-between">
                                    <Form.Select size="sm" className="mb-3 rounded w-50" onChange={async (event) => {
                                        scrapeSource.setScrapeSourceName(event.target.value);
                                        if (event.target.value.length > 0) {

                                            const resp = await fetch('/api/getScrapeSourceData', {
                                                method: "POST", headers: {
                                                    "Content-Type": "application/json",
                                                }, body: JSON.stringify({ scrape_source: event.target.value })
                                            }).then(res => res.json());
                                            if (resp.dataFetch) {
                                                setScrapeConfig(JSON.stringify(resp.data.data, null, 2));
                                            }
                                        } else {
                                            setScrapeConfig("");
                                        }

                                    }
                                    }
                                    >
                                        <option value="">Select from list</option>
                                        {listOfScrapeSource.map((val) => <option key={val} value={val}>{val}</option>)}
                                    </Form.Select>
                                    <Button variant="outline-primary" onClick={() => setModalShowFlag(true)} className="mb-3 w-45 ml-2">
                                        + New Source
                                    </Button>
                                </div>
                                <Form.Text className="text-muted">
                                    Can't find your source? Add it using the button.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formData">
                                <Form.Label className="font-weight-bold text-dark mb-2">Brand Data</Form.Label>
                                <Form.Control as="textarea" rows={15}
                                    placeholder={JSON.stringify(productBrandData, null, 2)}
                                    value={scrapeConfig}
                                    onChange={(event) => setScrapeConfig(event.target.value)}
                                    className="rounded" />
                                <Form.Text className="text-muted mt-2">
                                    Preview of current brand data.
                                </Form.Text>
                            </Form.Group>

                            <div className="d-grid">
                                <Button variant="outline-primary" className="rounded py-2" type="submit">
                                    Update Brand Data
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}
