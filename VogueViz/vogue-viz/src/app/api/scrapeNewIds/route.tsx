import { NextRequest } from "next/server";
import scrapeNewIds from "./myntraScrape";

export async function POST(request: NextRequest) {

	try {
		const req = await request.json();
		if (req.API_CALL_VALID) {
			await scrapeNewIds();
		}
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ scrapeDone: false }, { status: 200 });
	}
	return Response.json({ scrapeDone: true }, { status: 200 });
}