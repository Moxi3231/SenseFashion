import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";

export async function POST(request: NextRequest) {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = await db.collection(dbConfig.ConfigCollection);
		const jdata = await request.json();
		data = await collection.findOneAndUpdate({ScrapeSource:jdata.scrape_source},{$set:{data:jdata.data}})
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataUpdated: false }, { status: 200 });
	}
	return Response.json({ dataUpdated: true }, { status: 200 });
}