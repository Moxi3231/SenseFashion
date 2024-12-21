import dbConfig from "@/components/mongoConfig";
import clientPromise from "../mongo-client";

export default async function validateAndUpdateProducts(){
  let data;
  try {
    const mongoClientPromise = await clientPromise;
    const db = mongoClientPromise.db(dbConfig.DataBase);
    const collection = await db.collection(dbConfig.ProductsCollection);

    const products: Array<any> = await collection.find().toArray();
    let maxScrapeLen = 0;
    products.forEach((product) => {
      maxScrapeLen = Math.max(maxScrapeLen, product.rating.length);
    });

    products.forEach(async (product) => {
      const ratings: Array<any> = product.rating;
      const ratingsCount: Array<any> = product.ratingCount;
      const prices: Array<any> = product.price;
      if (ratings.length == maxScrapeLen) {
        return;
      }
      if (maxScrapeLen - 1 == ratings.length) {
        await collection.updateOne(
          { productId: product["productId"] },
          {
            $push: {
              ratingCount: product["ratingCount"].at(-1),
              rating: product["rating"].at(-1),
              price: product["price"].at(-1),
            },
          }
        );
      } else {
        ratings.unshift(new Array(maxScrapeLen - ratings.length).fill(0));
        ratingsCount.unshift(
          new Array(maxScrapeLen - ratingsCount.length).fill(0)
        );
        prices.unshift(new Array(maxScrapeLen - prices.length).fill(0));

        await collection.updateOne(
          { productId: product["productId"] },
          {
            $set: {
              rating: ratings.flat(),
              ratingCount: ratingsCount.flat(),
              price: prices.flat(),
            },
          }
        );
      }
    });
  } catch (exception) {
    console.log(exception);
    return Response.json({ dataFetch: false }, { status: 200 });
  }
  return Response.json({ dataFetch: true, data: data }, { status: 200 });
}
