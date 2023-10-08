import dbConfig from "@/components/mongoConfig";
import clientPromise from "../mongo-client";

export async function POST() {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = await db.collection(dbConfig.ConfigCollection);
		data = await collection.find().project({"_id":0,"data":0}).toArray()
		data.forEach((item,idx,arr) => {arr[idx] = item.ScrapeSource})
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}