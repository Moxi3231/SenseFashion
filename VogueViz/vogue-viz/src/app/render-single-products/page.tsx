"use client";
import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import {
  Popover,
  OverlayTrigger,
  Row,
  Col,
} from "react-bootstrap";

import { DayPicker } from "react-day-picker";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { CardBody, CardHeader, Table } from "react-bootstrap";

export default function scrapeData() {
  const { data: session, status } = useSession();
  const [productData, setProductData] = useState<Array<any>>([]);
  const [selectedDate, setSelectedDate] = useState<any>(new Date());

  if (status == "unauthenticated") {
    redirect("/unauthorizedLogin");
  }

  const fetchDataFromSelectedDate = async (date: any = new Date()) => {
    const response = await fetch("/api/getProductsFromSingles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedDate: date }),
    }).then((res) => res.json());
    if (response.dataFetch) {
      const productList = new Array<any>();
      response.data.forEach((product: any) => productList.push(product));
      setProductData(productList);
    }
  };
  const chooseDate = (
    <Popover
      style={{
        maxWidth: "100%",
      }}
    >
      <DayPicker
        mode="single"
        selected={selectedDate}
        disabled={[
          {
            from: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            to: new Date(2300, 1, 1),
          },
        ]}
        onSelect={(date) => {
          setSelectedDate(date!);
          fetchDataFromSelectedDate(date);
        }}
      />
    </Popover>
  );

  const downloadExcel = async () => {
    const response = await fetch("/api/getExcelFileSingleProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedDate: selectedDate }),
    });
    console.log(response)
    const blob = await response.blob();
    console.log(blob)
    // Create a link element and trigger a download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedDate.toDateString() +' Excel.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };


  useEffect(() => {
    fetchDataFromSelectedDate();
  }, []);

  return (
    <>
      <Container>
        <Card>
          <CardHeader className="justify-content-center text-center">
            Products
          </CardHeader>
          <CardBody>
            <Row className="justify-content-center mt-3">
              <Col xs="auto">
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={chooseDate}
                >
                  <Button variant="info">
                    Start Date:{" "}
                    {selectedDate ? format(selectedDate, "PP") : "Select"}
                  </Button>
                </OverlayTrigger>
              </Col>
              <Col xs="auto">
                <Button variant="info" onClick={downloadExcel}>Download {selectedDate ? format(selectedDate, "PP") : "Select"}'s' Data</Button>
              </Col>
            </Row>
            <Table
              striped
              bordered
              hover
              responsive
              className="text-center my-4"
            >
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>Product ID</th>
                  <th>Rating Count</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.productId}</td>
                    <td>{product.rating}</td>
                    <td>{product.ratingCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}
