import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
import dbConfig from "@/components/mongoConfig";

/*function convertToNumber(str: string): number {
	const lowerCaseStr = str.toLowerCase();
	let multiplier = 1;
	if (lowerCaseStr.endsWith('k')) {
		multiplier = 1000;
	} else if (lowerCaseStr.endsWith('m')) {
		multiplier = 1000000;
	}
	const numberPart = parseFloat(lowerCaseStr);
	if (isNaN(numberPart)) {
		return NaN;
	}
	return numberPart * multiplier;
}
*/
export async function POST(request: NextRequest) {
	let data = null;
	try {

		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db(dbConfig.DataBase);
		const collection = db.collection(dbConfig.ProductsCollection);

		const { site_name, category, brand_name, prev_days } = await request.json();
		const date: Date = new Date();
		date.setDate(date.getDate() - prev_days);
		const query = {
			site_name: { $regex: new RegExp('^' + site_name + '$', 'i') },
			category: { $regex: new RegExp('^' + category + '$', 'i') },
			brand_name: { $regex: new RegExp('^' + brand_name + '$', 'i') },
			first_scrape_date : { $gte: date }
		};

		data = await collection.find(query).toArray();
		data.sort((doc1,doc2) => (doc2['rating'].at(-1) * doc2['ratingCount'].at(-1)) - (doc1['rating'].at(-1) * doc1['ratingCount'].at(-1)));

		//let jpid = (await collection.find(query).project({ _id: 0, site_name: 0, category: 0, brand_name: 0, date: 0 }).toArray());
		//jpid.forEach((value, index, array) => { array[index] = value.pid })
		//const prd_data_cnt = db.collection("PRD_RT_CNT");
		///////
		/*if (false) {
			(await prd_data_cnt.find({}).toArray()).forEach((val) => {
				if (typeof val.user_count === "string") {
					prd_data_cnt.updateOne({ _id: val._id }, { $set: { user_count: convertToNumber(val.user_count) } })
				}
			})
		}
		////////
		data = await prd_data_cnt.aggregate(
			[
				{ $match: { "pid": { $in: jpid } } },
				{ $sort: { "pid": 1, "date": -1 } },
				{ $group: { _id: "$pid", maxDateDoc: { $first: "$$ROOT" } } },
				{ $replaceRoot: { newRoot: "$maxDateDoc" } },
			]).project({ _id: 0, date: 0, Sizes: 0, SP: 0 }).
			toArray();
		data.sort((a,b) => (b.user_count * b.avg_rating) - (a.user_count * a.avg_rating))
		*/

	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}
