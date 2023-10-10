"use client";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
function ProductDetailCard(props: any) {
    const pData = props.pData;
    const images = props.images;
    return (
        <Row className="mb-4">
            
            <Col md={6} className="w-50">

                <Card className="shadow-sm h-100">
                    {!pData.eData && <>
                        <Spinner animation="grow" className="text-center m-auto" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner></>}
                    {pData.eData && (<>
                        <Card.Header>
                            <Card.Title>{pData.eData.productName}</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Card.Text className="mb-2">
                                        <strong>Brand:</strong> <span className="text-muted">{pData.eData.brand_name}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>Category:</strong> <span className="text-muted">{pData.eData.category}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>Scrape Date:</strong> <span className="text-muted">{new Date(pData.eData.first_scrape_date).toDateString()}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>MRP:</strong> <span className="text-muted">{pData.eData.mrp}</span>
                                    </Card.Text>
                                </Col>

                                <Col md={6}>
                                    <Card.Text className="mb-2">
                                        <strong>Price:</strong> <span className="text-primary">{pData.eData.price.at(-1)}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>Product ID:</strong> <span className="text-muted">{pData.eData.productId}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>Sizes:</strong> <span className="text-muted">{pData.eData.sizes}</span>
                                    </Card.Text>
                                    <Card.Text className="mb-2">
                                        <strong>Website:</strong> <span className="text-muted">{pData.eData.site_name}</span>
                                    </Card.Text>
                                </Col>

                            </Row>
                            <Card.Text>
                                <Form.Control as="textarea" rows={10} defaultValue={JSON.stringify(pData.eData.inventoryInfo, null, 2)} disabled></Form.Control>
                            </Card.Text>
                            <Row>
                            </Row>
                            
                        </Card.Body>
                        <Card.Footer>
                        <a href={"https://myntra.com/".concat(pData.eData.landingPageUrl)} target="_blank" className="mt-3 text-muted text-center">
                                Visit Product Page
                            </a>
                        </Card.Footer>
                    </>)}
                </Card>

            </Col>
            <Col md={6} className="w-50">
                <Card className="shadow-sm h-100 p-1">
                    <Carousel fade data-bs-theme="dark">
                        {
                            images && images.map((img_url: string, idx: number) => (
                                <Carousel.Item key={"ImageAt".concat(idx.toString())} className="d-block w-100">
                                    <Image style={{ height: 500 }} className="d-block m-auto" src={img_url}></Image>
                                    <Carousel.Caption><h4>Image: {idx + 1}</h4></Carousel.Caption>
                                </Carousel.Item>
                            ))
                        }
                    </Carousel>
                </Card>
            </Col>
        </Row>
    );
}
export default function vizCharts({ params }: { params: { slug: string } }) {
    const [pData, setPData] = useState<any>({});
    const [images, setImages] = useState<string[]>([]);

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
            const images_tmp: any = [];
            Array.from(new Set(transformedData.eData.images)).map((val) => {
                if (val !== "")
                    images_tmp.push(val);
            })
            setImages(images_tmp);
            setPData(transformedData);   
        }
    };

    useEffect(() => { fetchData(); }, [])
    return (<>

        <Container className="mt-5">
            <ProductDetailCard pData={pData} images={images}></ProductDetailCard>

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
                            <LineChart key={"G2"} id="G2" width={1200} height={600} data={pData.graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
