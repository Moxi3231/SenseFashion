import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGO_URI!);
const clientPromise = mongoClient.connect();
export default clientPromise;