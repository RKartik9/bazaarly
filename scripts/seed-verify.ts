import "dotenv/config";
import { config } from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/db/mongoose";
import { Product } from "../src/lib/db/models";

config({ path: ".env.local", override: false });

const MIN_SKUS = 50;

async function main() {
  await connectDb();
  const [stats] = await Product.aggregate<{ products: number; skus: number }>([
    { $match: { status: "active" } },
    { $project: { skuCount: { $size: "$variants" } } },
    { $group: { _id: null, products: { $sum: 1 }, skus: { $sum: "$skuCount" } } },
    { $project: { _id: 0, products: 1, skus: 1 } },
  ]);

  const products = stats?.products ?? 0;
  const skus = stats?.skus ?? 0;
  console.log(`Active products: ${products}`);
  console.log(`Active SKUs:     ${skus}`);
  await mongoose.disconnect();

  if (skus < MIN_SKUS) {
    console.error(`Expected at least ${MIN_SKUS} SKUs, found ${skus}.`);
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
