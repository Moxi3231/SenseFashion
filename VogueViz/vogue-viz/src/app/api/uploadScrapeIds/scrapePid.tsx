import { parse } from "node-html-parser";
import headers from "@/components/UserAgent";
import insertSingleProductData from "./insertSingleProductData";
import { Rhodium_Libre } from "next/font/google";

export default async function scrapeMyntraPid(pid: any) {
  try {
    const scrapeUrl = "https://www.myntra.com/" + pid;
    
    const rHeader =  headers[Math.floor(Math.random() * headers.length)];

    await fetch(scrapeUrl, {
      headers: {
        "User-Agent": rHeader
      },
    }).then(async (response) => {
      if (response.ok) {
        const html_data = await response.text();


        const scripts = parse(html_data).getElementsByTagName("script");

        for (const script of scripts) {
          const str_script = script.toString();
          if (str_script.startsWith("<script>window.__myx =")) {
            const jsonData = await JSON.parse(str_script.match("{.*}")?.at(0)!);
            const product = jsonData["pdpData"];
            
            const filtered_data = {
              landingPageUrl: scrapeUrl,
              productId: product["id"],
              productName: product["name"],
              rating: product["ratings"]["averageRating"],
              ratingCount: product["ratings"]["totalCount"],
              images: product["media"]["albums"],
              price: [product["price"]],
              mrp: product["mrp"],
              site_name: "MYNTRA",
              manufacturer: product["manufacturer"],
              brand_name: product["brand"]["name"],
              scrapeDate: new Date(),
            };
            if (filtered_data != null) insertSingleProductData(filtered_data);
          }
        }
      } else{
        console.log("Could Not Fecth Data", response);
      }
    });
  } catch (exception) {
    console.log('Failure for PID:', pid);
    console.log(exception);
  }
}
