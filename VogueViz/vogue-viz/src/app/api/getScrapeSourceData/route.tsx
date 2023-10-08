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
		data = (await collection.find({ScrapeSource:jdata.scrape_source}).toArray()).at(0);
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}