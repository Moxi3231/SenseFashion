import dbConfig from "@/components/mongoConfig";
import clientPromise from "../mongo-client";

export async function POST() {
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
      if (ratings.length == maxScrapeLen) return;
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
    });
  } catch (exception) {
    console.log(exception);
    return Response.json({ dataFetch: false }, { status: 200 });
  }
  return Response.json({ dataFetch: true, data: data }, { status: 200 });
}
