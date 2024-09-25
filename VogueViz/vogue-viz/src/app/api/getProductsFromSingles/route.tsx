import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";


export async function POST(request: NextRequest) {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = db.collection(dbConfig.SingleProductsCollections);
		

		const resp = await request.json();
		const selectedDate = new Date(resp.selectedDate.split('T')[0]);
		const lowerSelectedDate = new Date(selectedDate.getTime() - (24 * 60 * 60 * 1000) );
		const upperSelectedDate = new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000) );


		data = await collection.find({'scrapeDate': {$gte: lowerSelectedDate, $lte: upperSelectedDate}}).toArray();
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}