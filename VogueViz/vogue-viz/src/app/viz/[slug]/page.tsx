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

const graphColors = [
    "#A2D5F2", // Pastel Blue
    "#91E5A9", // Muted Green
    "#FEC8D8", // Soft Peach
    "#DAC4FF", // Light Lavender
    "#FFD3BA", // Warm Sand
    "#3ECFAF", // Pastel Turquoise
    "#FF9AA2", // Muted Coral
    "#FFB7B2", // Misty Rose
    "#ACD39E", // Pastel Olive
    "#CFCFCF"  // Cool Grey
];



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
            const transformedData = { graphData: new Array<any>(), priceData: new Array<any>(), inventoryData: new Array<any>(), eData: data };
            for (var i = 0; i < data.rating.length; i++) {
                transformedData.graphData.push({
                    rating: data.rating[i],
                    day_nm: i + 1,
                    ratingCount: data.ratingCount[i]
                });
            }
            for (var i = 0; i < data.price.length; i++) {
                transformedData.priceData.push({
                    price: data.price.at(i),
                    day_nm: i + 1
                })
            }
            ////

            data.inventoryInfo.forEach((inventoryInfo: any, idx: number) => {
                if (data.sizes) {
                    const raw_size: any = {};
                    data.sizes!.split(",").forEach((size: string) => {
                        raw_size[size] = 0;
                    });
                    inventoryInfo.forEach((item: any) => {
                        raw_size[item['brandSizeLabel']] = item['inventory'];
                    });
                    raw_size['day_nm'] = idx + 1;
                    transformedData.inventoryData.push(raw_size);
                }
            })

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

            <Row className="mb-4 gap-3">
                <Col md={12}>
                    <Card className="shadow-sm">
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

                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Price</Card.Title>
                            <LineChart key={"G3"} id="G3" width={1200} height={600} data={pData.priceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="price" stroke="#8884d8" />
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
                            <Card.Title>Inventory</Card.Title>
                            <LineChart key={"G3"} id="G3" width={1200} height={600} data={pData.inventoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                {pData.eData && pData.eData.sizes && pData.eData.sizes.split(",").map((size: string, idx: number) =>
                                    (<Line key={size} type="monotone" dataKey={size} stroke={graphColors.at(idx)} />)
                                )}
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
