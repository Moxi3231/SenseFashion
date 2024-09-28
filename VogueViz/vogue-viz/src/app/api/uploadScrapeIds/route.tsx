import * as XLSX from "xlsx";

import { NextRequest } from "next/server";
import scrapeMyntraPid from "./scrapePid";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  let data;
  try {
    const formData = await request.formData();

    const fileBuffer = await Buffer.from(
      await formData.get("scrapeFile")!.arrayBuffer()
    );

    const workBook = XLSX.read(fileBuffer);
    const fileJsonRows = await XLSX.utils.sheet_to_json(
      workBook.Sheets[workBook.SheetNames[0]]
    );

     for(var row of fileJsonRows){
    	scrapeMyntraPid(row['Product Id']);
      await sleep(500);
    }

    
  } catch (exception) {
    console.log(exception);
    return Response.json({ dataUpdated: false }, { status: 200 });
  }
  return Response.json({ dataUpdated: true }, { status: 200 });
}
