import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";


export async function POST(request: NextRequest) {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = await db.collection(dbConfig.ConfigCollection);
		const resp = await request.json();
        collection.insertOne({ScrapeSource:resp.ScrapeSource,data:{}})
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataInsert: false }, { status: 200 });
	}
	return Response.json({ dataInsert: true, data: data }, { status: 200 });
}