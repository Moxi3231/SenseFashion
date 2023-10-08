import { NextRequest } from "next/server";



export async function POST(request: NextRequest) {

	let flag = false;
	try {
		const req = await request.json();
		console.log(req);
        if(req.username === process.env.USER_NAME && req.password == process.env.PASSWORD){
            flag = true;
			return Response.json({ valid: true, user : {name: req.username}}, { status: 200 });
        }
	}
	catch (exception) {
		console.log(exception);
		return Response.json({ valid: false }, { status: 200 });
	}
	return Response.json({ valid: false}, { status: 200 });
}