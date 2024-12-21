import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";


export async function GET() {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = db.collection(dbConfig.ProductsCollection);

        data = await collection.find({}).toArray();
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}