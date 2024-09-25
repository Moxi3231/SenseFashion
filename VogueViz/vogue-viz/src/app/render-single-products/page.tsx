"use client";
import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { CardBody, CardHeader, Table } from "react-bootstrap";

export default function scrapeData() {
  const { data: session, status } = useSession();
  const [productData, setProductData] = useState<Array<any>>([]);
  const [selectedDate, setSelectedDate] = useState<any>(new Date());

  if (status == "unauthenticated") {
    redirect("/unauthorizedLogin");
  }

  const fetchDataFromSelectedDate = async () => {
    const response = await fetch("/api/getProductsFromSingles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedDate: selectedDate }),
    }).then((res) => res.json());
    if (response.dataFetch) {
      const productList = new Array<any>();
      response.data.forEach((product: any) => productList.push(product));
      setProductData(productList);
    }
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
