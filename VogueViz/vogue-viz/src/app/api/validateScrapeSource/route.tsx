import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";


export async function POST(request: NextRequest) {
	let flag = false;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = await db.collection(dbConfig.ConfigCollection);
		const jdata = await request.json();
		if ((await collection.find({ScrapeSource:jdata.ScrapeSource}).toArray()).length > 0)
            flag = true;
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, isPresent:flag }, { status: 200 });
}