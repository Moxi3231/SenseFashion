"use client";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";
import ScrapeSource from "@/components/Models/ScrapeSource";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
export default function viz() {

    const [scrapeSource, setScrapeSource] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");

    const [sources, setSources] = useState(Array<String>);
    const [categories, setCategories] = useState(Array<String>);
    const [brands, setBrands] = useState(Array<String>);

    const [configData, setConfigData] = useState<any>({});

    const [pRatings, setPRatings] = useState<Array<any>>([]);
    const fetchScrapeSources = async () => {
        const data: Array<String> = (await ScrapeSource.fetchScrapeSources()).data;
        setSources(data);
    };
    const fetchSourceData = async (event: any) => {
        setScrapeSource(event.target.value)
        const configData = await fetch('/api/getScrapeSourceData', {
            method: "POST", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({ scrape_source: event.target.value })
        }).then(res => res.json());
        if (configData.dataFetch) {
            setCategories(Object.keys(configData.data.data));
            setConfigData(configData.data.data);
        }
    };
    const updateBrandsFromConfig = (event: any) => {
        const current_category = event.target.value;
        setCategory(current_category);
        try {
            setBrands(configData[current_category]["brands"])
        } catch (exception) {
            console.log(exception);
        }
    }
    const fetchPIDs = async (event: any) => {
        setBrand(event.target.value);
        if (event.target.value != "") {
            const resp = await fetch('/api/getProductsIds',
                {
                    method: "POST",
                    body: JSON.stringify({
                        site_name: scrapeSource,
                        category: category,
                        brand_name: event.target.value,
                        prev_days: 40
                    })
                }).then(res => res.json());
            if (resp.dataFetch) {
                setPRatings(resp.data);
            }
        }
    }
    useEffect(() => {
        fetchScrapeSources();
    }, []);
    return (<Container className="shadow-sm my-5 p-4 rounded">
        <Row className="align-items-center mb-4">
            <Col xs={4} className="text-center">
                <Form.Label className="font-weight-bold text-dark mb-2">Scrape Source</Form.Label>
                <Form.Select className="w-75 mx-auto" onChange={(event) => { fetchSourceData(event) }}>
                    <option value={""}>Select Source</option>
                    {sources.map((src) => <option key={src.toString()} value={src.toString()}>{src.toString()}</option>)}
                </Form.Select>
            </Col>
            <Col xs={4} className="text-center">
                <Form.Label className="font-weight-bold text-dark mb-2">Category Selection</Form.Label>
                <Form.Select className="w-75 mx-auto" disabled={scrapeSource.length == 0} onChange={(event) => { updateBrandsFromConfig(event); }}>
                    <option value={""}>Select Category</option>
                    {categories.map((ctg) => <option key={ctg.toString()} value={ctg.toString()}>{ctg.toString()}</option>)}
                </Form.Select>
            </Col>
            <Col xs={4} className="text-center">
                <Form.Label className="font-weight-bold text-dark mb-2">Brand Selection</Form.Label>
                <Form.Select className="w-75 mx-auto" disabled={category.length == 0} onChange={(event) => { fetchPIDs(event) }}>
                    <option value={""}>Select Brand</option>
                    {brands.map((brn) => <option key={brn.toString()} value={brn.toString()}>{brn.toString()}</option>)}
                </Form.Select>
            </Col>
        </Row>



        <Container className="border-top pt-4 mt-4">
            {scrapeSource.length > 0 && category.length > 0 && brand.length > 0 ? (
                <h5 className="text-center mb-4">List of IDS</h5>
            ) : (
                <>
                    {scrapeSource.length === 0 ?
                        <Alert variant="danger" className="text-center py-1">
                            Please select a Scrape Source.
                        </Alert>
                        : category.length === 0 ?
                            <Alert variant="danger" className="text-center py-1">
                                Category is required. Make a selection.
                            </Alert>
                            : brand.length === 0 &&
                            <Alert variant="danger" className="text-center py-1">
                                Don't forget to pick a Brand.
                            </Alert>
                    }
                </>
            )}

            {brand.length > 0 &&
                <><Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Product Id</th>
                            <th>Avg Rating</th>
                            <th>User Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            pRatings.map((val) => 
                            <tr key={val._id}>
                                <th>
                                    <Nav.Link href={"/viz/"
                                        .concat(new Number(val.productId).toString())}>{val.productId}</Nav.Link>
                                </th>
                                <th>{val['rating'].at(-1)}</th>
                                <th>{val.ratingCount.at(-1)}</th>
                            </tr>)
                        }
                    </tbody>
                </Table>
                    <div className="d-flex justify-content-between mt-3">
                        <Button
                            variant="primary"
                        >
                            Previous
                        </Button>

                        <Button
                            variant="primary"
                        >
                            Next
                        </Button>
                    </div></>

            }
        </Container>
    </Container>
    );
}
