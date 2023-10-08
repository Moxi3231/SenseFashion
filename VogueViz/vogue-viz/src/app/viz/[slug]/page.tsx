"use client";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function vizCharts({ params }: { params: { slug: string } }) {
    const [pData, setPData] = useState<any>({});
    const pid = params.slug;
    const fetchData = async () => {

        const resp = await fetch('/api/getPIDData', {
            method: "POST", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({ productId: Number.parseInt(pid) })
        }).then(res => res.json());
        if (resp.dataFetch) {
            const data: any = resp.data;
            const transformedData = { graphData: new Array<any>(), eData: data };
            for (var i = 0; i < data.rating.length; i++) {
                transformedData.graphData.push({
                    rating: data.rating[i],
                    day_nm: i + 1,
                    ratingCount: data.ratingCount[i]
                });
            }
            setPData(transformedData);
        }
    };

    useEffect(() => { fetchData(); }, [])
    return (<>

        <Container className="mt-5">
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Source</Card.Title>
                            <Card.Text>{pData.eData && pData.eData.site_name}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Category</Card.Title>
                            <Card.Text>{pData.eData && pData.eData.category}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Brand</Card.Title>
                            <Card.Text>{pData.eData && pData.eData.brand_name}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Product ID</Card.Title>
                            <Card.Text>{pid}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title>Average Ratings</Card.Title>
                            <LineChart id="G1" width={1200} height={600} data={pData.graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <XAxis dataKey="day_nm" />
                                <YAxis />
                                <Tooltip />
                            </LineChart>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>User Count</Card.Title>
                            <LineChart id="G2" width={1200} height={600} data={pData.graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="ratingCount" stroke="#8884d8" />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <XAxis dataKey="day_nm" />
                                <YAxis />
                                <Tooltip />
                            </LineChart>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container></>
    );
}
