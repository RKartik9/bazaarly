import "dotenv/config";
import { config } from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/db/mongoose";
import { Category, Coupon, Product, Review, User } from "../src/lib/db/models";
import { slugify } from "../src/lib/utils";
import { categories } from "./seed/categories";
import { coupons } from "./seed/coupons";
import { electronics } from "./seed/electronics";
import { fashionMen } from "./seed/fashion-men";
import { fashionWomen } from "./seed/fashion-women";
import { footwear } from "./seed/footwear";
import { homeKitchen } from "./seed/home-kitchen";
import { beauty } from "./seed/beauty";
import { sports } from "./seed/sports";
import { booksStationery } from "./seed/books-stationery";
import { reviewTemplates, reviewers } from "./seed/reviews";
import type { SeedProduct } from "./seed/helpers";

config({ path: ".env.local", override: false });

const allProducts: SeedProduct[] = [
  ...electronics,
  ...fashionMen,
  ...fashionWomen,
  ...footwear,
  ...homeKitchen,
  ...beauty,
  ...sports,
  ...booksStationery,
];

async function resetCatalog() {
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    User.deleteMany({ clerkId: /^seed_/ }),
  ]);
}

async function seedCategories() {
  const idBySlug = new Map<string, mongoose.Types.ObjectId>();
  const pathBySlug = new Map<string, string[]>();

  for (const [order, parent] of categories.entries()) {
    const parentDoc = await Category.create({
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      image: parent.image,
      tint: parent.tint,
      order,
    });
    idBySlug.set(parent.slug, parentDoc._id);
    pathBySlug.set(parent.slug, [parent.slug]);

    for (const [childOrder, child] of parent.children.entries()) {
      const childDoc = await Category.create({
        name: child.name,
        slug: child.slug,
        image: parent.image,
        tint: parent.tint,
        parent: parentDoc._id,
        order: childOrder,
      });
      idBySlug.set(child.slug, childDoc._id);
      pathBySlug.set(child.slug, [parent.slug, child.slug]);
    }
  }
  return { idBySlug, pathBySlug };
}

async function seedProducts(
  idBySlug: Map<string, mongoose.Types.ObjectId>,
  pathBySlug: Map<string, string[]>,
) {
  const docs = allProducts.map((p, i) => {
    const categoryId = idBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);
    const prices = p.variants.map((v) => v.price);
    const mrps = p.variants.map((v) => v.mrp);
    return {
      ...p,
      slug: slugify(p.title),
      category: categoryId,
      categoryPath: pathBySlug.get(p.category),
      basePrice: Math.min(...prices),
      baseMrp: Math.max(...mrps),
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
      soldCount: Math.floor(((i * 37) % 400) + 20),
      dealEndsAt: p.isDeal ? new Date(Date.now() + (3 + (i % 5)) * 86_400_000) : undefined,
      status: "active" as const,
    };
  });
  return Product.insertMany(docs);
}

async function seedReviews(products: { _id: mongoose.Types.ObjectId; isFeatured?: boolean }[]) {
  const users = await User.insertMany(
    reviewers.map((r) => ({ clerkId: r.clerkId, name: r.name, email: r.email, role: "customer" })),
  );

  const reviews: Record<string, unknown>[] = [];
  const ratingUpdates: Promise<unknown>[] = [];

  products.forEach((product, i) => {
    const count = product.isFeatured ? 4 + (i % 3) : 2 + (i % 3);
    let sum = 0;
    for (let k = 0; k < count; k++) {
      const template = reviewTemplates[(i + k * 3) % reviewTemplates.length]!;
      const user = users[(i + k) % users.length]!;
      sum += template.rating;
      reviews.push({
        product: product._id,
        userId: user._id,
        authorName: user.name,
        rating: template.rating,
        title: template.title,
        body: template.body,
        verifiedPurchase: k % 2 === 0,
        helpful: (i * 7 + k * 3) % 40,
        createdAt: new Date(Date.now() - (k + 1) * 4 * 86_400_000),
      });
    }
    ratingUpdates.push(
      Product.updateOne(
        { _id: product._id },
        { $set: { "rating.avg": Math.round((sum / count) * 10) / 10, "rating.count": count } },
      ),
    );
  });

  await Review.insertMany(reviews);
  await Promise.all(ratingUpdates);
  return reviews.length;
}

async function main() {
  await connectDb();
  console.log("Connected. Resetting catalog collections…");
  await resetCatalog();

  const { idBySlug, pathBySlug } = await seedCategories();
  const products = await seedProducts(idBySlug, pathBySlug);
  const reviewCount = await seedReviews(products);
  await Coupon.insertMany(coupons.map((c) => ({ ...c })));

  const skuCount = products.reduce((s, p) => s + p.variants.length, 0);
  console.log(`Categories: ${idBySlug.size}`);
  console.log(`Products:   ${products.length}`);
  console.log(`SKUs:       ${skuCount}`);
  console.log(`Reviews:    ${reviewCount}`);
  console.log(`Coupons:    ${coupons.length}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
