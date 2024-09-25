import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";


export default async function insertSingleProductData(filtered_data: any) {
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = await db.collection(dbConfig.SingleProductsCollections);
        collection.insertOne(filtered_data);
    } catch(exception){
        console.log(exception);
    }
}