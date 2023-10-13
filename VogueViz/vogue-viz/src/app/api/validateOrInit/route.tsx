import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";

async function init(){
    let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = db.collection(dbConfig.ProductsCollection);
		collection.createIndex({productId: 1});
	}
	catch (exception) {
		console.log(exception);
	}
}
async function validate(){

	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = db.collection(dbConfig.ProductsCollection);
        const data = await collection.find({}).toArray();
        data.forEach((document)=>{
            collection.updateOne({productId:document['productId']},{$set:{inventoryInfo:new Array<any>(document['inventoryInfo'])}});
        })
	}
	catch (exception) {
		console.log(exception);
	}
}
export async function POST(request: NextRequest) {

	try {
		const req = await request.json();
		if (req.API_CALL_VALID) {
            //await init();
            //await validate();
		}
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ taskDone: false }, { status: 200 });
	}
	return Response.json({ taskDone: true }, { status: 200 });
}