"use client";
import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import { Table } from "react-bootstrap";

export default function compareAndViz() {
  const [productData, setProductData] = useState(Array<any>);
  const [isPatchInProgress, setPatchInProgress] = useState(false);

  const fetchProductIds = async () => {
    try {

//      const res = await fetch("/api/getAllProducts", { method: "GET" });
  //    const data = await res.json();

      
    } catch (exception) {
      console.log("Error", exception);
    }
  };

  useEffect(() => {
    fetchProductIds();
  }, []);
  return (
    <>
      

        <div className="card shadow-sm p-4">
          <h4 className="mb-4">Table Data</h4>
          <Table striped bordered hover responsive className="table-sm">
            <thead className="table-dark">
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody></tbody>
          </Table>
        </div>

    </>
  );
}
