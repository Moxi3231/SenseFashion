import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";

export async function POST(request: NextRequest) {
  let data;
  try {
    const mongoClientPromise = await clientPromise;
    const db = mongoClientPromise.db(dbConfig.DataBase);
    const collection = db.collection(dbConfig.SingleProductsCollections);

    const resp = await request.json();
    const selectedDate = new Date(resp.selectedDate.split("T")[0]);
    const lowerSelectedDate = new Date(
      selectedDate.getTime() - 24 * 60 * 60 * 1000
    );
    const upperSelectedDate = new Date(
      selectedDate.getTime() + 24 * 60 * 60 * 1000
    );

    data = await collection
      .find({
        scrapeDate: { $gte: lowerSelectedDate, $lte: upperSelectedDate },
      })
      .toArray();

    const productList = new Array<any>();
    productList.push(['productId','productName','Rating','Rating Count', 'MRP', 'Brand Name'])
    data.forEach((product: any) => productList.push([
        product['productId'], product['productName'], product['rating'], product['ratingCount'], product['mrp'], product['brand_name']
    ]));
      
    const workbook = XLSX.utils.book_new();


    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(productList);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook to a buffer (not saving to file)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    let headers = new Headers();
    // Set response headers
    headers.set("Content-Disposition", 'attachment; filename=' + selectedDate.toDateString() + ' "Sheet.xlsx"');
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the buffer as the response
    return new NextResponse(excelBuffer, {status:200, headers: headers,});

  } catch (exception) {
    console.log(exception);
    return Response.json({ dataFetch: false }, { status: 200 });
  }
}
