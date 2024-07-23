
import dbConfig from "@/components/mongoConfig";
import clientPromise from "../mongo-client";
import { parse } from 'node-html-parser';
import headers from "@/components/UserAgent";
import pLimit from 'p-limit'


async function getRecord(productId: number) {
    try {
        const cp = await clientPromise;
        const coll = cp.db(dbConfig.DataBase).collection(dbConfig.ProductsCollection);
        const result = await coll.findOne({ productId: productId });
        if (result) {
            return result;
        }
    }
    catch (exception) {
        console.error('Query Error');
        console.error(exception)
    }
}
async function insertData(filtered_data: any) {
    try {
        const record = await getRecord(filtered_data['productId'])
        if (record) {
            //Number of days 
            //console.log(record['rating'].length)
            //if (45 < record['rating'].length)
            //    return 1;
            //console.log(record);
            const cp = await clientPromise;
            const coll = cp.db(dbConfig.DataBase).collection(dbConfig.ProductsCollection);

            await coll.updateOne({ productId: filtered_data['productId'] }, {
                $push: {
                    ratingCount: filtered_data['ratingCount'][0],
                    rating: filtered_data['rating'][0],
                    price: filtered_data['price'][0],
                    //
                    //inventoryInfo: filtered_data['inventoryInfo']
                    //
                },
                $set: {
                    images: filtered_data["images"],
                    landingPageUrl: filtered_data["landingPageUrl"],
                    mrp: filtered_data['mrp'],
                    sizes: filtered_data['sizes']
                }
            }, { upsert: true });
        } else {
            const cp = await clientPromise;
            const coll = cp.db(dbConfig.DataBase).collection(dbConfig.ProductsCollection);
            await coll.insertOne(filtered_data);

        }
    }
    catch (exception) {
        console.error('Insertion Error');
        console.error(exception)
        return -1;
    }
    return 0;
}
async function fetchBrandPage(fin_url: string, brand_name: string, category: string, page_number: number) {
    let flag: boolean = false;
    try {
        const final_url_page = fin_url + "&p=" + page_number.toString();
        //console.log(final_url_page);
        await fetch(final_url_page, { headers: { 'User-Agent': headers[Math.floor(Math.random() * headers.length)] }  }).then(async (response) => {
            if (response.ok) {
                const html_data = await response.text();
                const scripts = parse(html_data).getElementsByTagName('script');
                for (const script of scripts) {
                    const str_script = script.toString();
                    if (str_script.startsWith('<script>window.__myx =')) {
                        const json_data = JSON.parse(str_script.match('{.*}')?.at(0)!);
                        const products_data: Array<any> = json_data['searchData']['results']['products'];
                        //products_data.forEach((product) => {
                        for (var product of products_data) {
                            product['images'].map((img: any, idx: number, arr: Array<any>) => { arr[idx] = img['src'] });
                            const filtered_data = {
                                landingPageUrl: product['landingPageUrl'],
                                productId: product['productId'],
                                productName: product['productName'],
                                rating: [product['rating']],
                                ratingCount: [product['ratingCount']],
                                images: product['images'],
                                sizes: product['sizes'],
                                price: [product['price']],
                                mrp: product['mrp'],
                                site_name: "MYNTRA",
                                brand_name: brand_name,
                                category: category,
                                //inventoryInfo: product['inventoryInfo'],
                                inventoryInfo: [],
                                first_scrape_date: new Date()
                            };
                            const sErrorCode = await insertData(filtered_data);
                            //console.log("CODE",sErrorCode);
                            //if (sErrorCode == 1)
                            //    return false;
                        }
                        //console.log("HAS NEXT PAGE: ",json_data['searchData']['results']['hasNextPage']);
                        flag = json_data['searchData']['results']['hasNextPage'];
                    }
                }

            }
        });
    } catch (exception) {
        console.error(exception);
    }

    return flag;
}
async function fetchBrand(fin_url: string, brand_name: string, category: string) {
    let page_number = 1;
    let hasNext = await fetchBrandPage(fin_url, brand_name, category, page_number);
    //console.log("Brand Page Done", brand_name, "Category:", category, " Page Num:", page_number, " HN: ",hasNext);
    while (hasNext) {
        page_number += 1
        hasNext = await fetchBrandPage(fin_url, brand_name, category, page_number);
        //console.log("Brand Page Done", brand_name, "Category:", category, " Page Num:", page_number, " HN: ",hasNext);
    }
    console.log("Brand Done", brand_name, " Category:", category);
    return;
}
export default async function scrapeNewIds() {
    try {

        const process_limit = pLimit(Number.parseInt(process.env.NUM_PROCESS_FETCH!));

        const cprm = await clientPromise;
        const collection = cprm.db(dbConfig.DataBase).collection(dbConfig.ConfigCollection);
        const myntraConfig: any = (await collection.find({ 'ScrapeSource': {$regex: new RegExp('Myntra','i')} }).toArray()).at(0);
        const config = myntraConfig['data'];

        const categories = Object.keys(config);

        const base_url_myntra = "https://www.myntra.com";

        const tasks = categories.flatMap(category => {
            const base_url_category = base_url_myntra + config[category]['url'];
            const brands: string[] = config[category]['brands'];
            return brands.map(brnd => process_limit(() => fetchBrand(base_url_category + brnd + "&sort=new", brnd, category)));
        });

        await Promise.all(tasks);

    } catch (exception) {
        console.log(exception);
    }
}   