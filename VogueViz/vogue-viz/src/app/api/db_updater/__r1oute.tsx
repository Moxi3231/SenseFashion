import { NextRequest } from "next/server";
import clientPromise from "../mongo-client";
//Not be used in deployment
function convertToNumber(str: string): number {
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

export async function POST(request: NextRequest) {
	let data;
	try {
		const mongoClientPromise = await clientPromise;
		const db = mongoClientPromise.db("Scrape");
		const collection = db.collection("BrandProductId");
		const prods = await collection.find({}).toArray();
		const c2 = db.collection("PRD_RT_CNT")
		const c3 = db.collection("Products")
		c3.createIndex({productId:1})
		for(var product of prods){
			const d = await c2.find({pid:product.pid}).sort({date:1}).toArray()
			const avg_ratings = new Array<number>();
			const user_Counts = new Array<number>();
			const sps = new Array<number>();
			console.log(d);
			d.map((doc) => {
				avg_ratings.push(doc['avg_rating'])
				let ucount = doc['user_count'];
				if(typeof doc['user_count'] !== 'number')
					ucount = convertToNumber(ucount);
				user_Counts.push(ucount)
				sps.push(doc['SP'])
			})
			const nprd = {
				productId: product['pid'],
				rating: avg_ratings,
				ratingCount: user_Counts,
				images:[],
				price: sps,
				mrp: 0,
				site_name: product['site_name'],
				brand_name: product['brand_name'],
				category: product['category'],
				first_scrape_date: product['date']
			};
			
			c3.insertOne(nprd);
		}
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ dataFetch: false }, { status: 200 });
	}
	return Response.json({ dataFetch: true, data: data }, { status: 200 });
}