import { img } from "./helpers";

export type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
  tint: string;
  children: { name: string; slug: string }[];
};

export const categories: SeedCategory[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Phones, audio, laptops and wearables from the brands you trust.",
    image: img("photo-1498049794561-7780e7231661"),
    tint: "sky",
    children: [
      { name: "Mobiles", slug: "mobiles" },
      { name: "Audio", slug: "audio" },
      { name: "Laptops & Tablets", slug: "laptops-tablets" },
      { name: "Wearables", slug: "wearables" },
    ],
  },
  {
    name: "Men's Fashion",
    slug: "mens-fashion",
    description: "Everyday essentials to festive fits.",
    image: img("photo-1490114538077-0a7f8cb49891"),
    tint: "mint",
    children: [
      { name: "Topwear", slug: "mens-topwear" },
      { name: "Bottomwear", slug: "mens-bottomwear" },
      { name: "Ethnic Wear", slug: "mens-ethnic" },
    ],
  },
  {
    name: "Women's Fashion",
    slug: "womens-fashion",
    description: "Dresses, sarees, kurtas and the layers in between.",
    image: img("photo-1483985988355-763728e1935b"),
    tint: "blush",
    children: [
      { name: "Dresses", slug: "womens-dresses" },
      { name: "Ethnic Wear", slug: "womens-ethnic" },
      { name: "Tops & Tees", slug: "womens-tops" },
    ],
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Sneakers, runners, sandals and boots for every pace.",
    image: img("photo-1549298916-b41d501d3772"),
    tint: "butter",
    children: [
      { name: "Sneakers", slug: "sneakers" },
      { name: "Sports Shoes", slug: "sports-shoes" },
      { name: "Sandals & Boots", slug: "sandals-boots" },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Appliances, decor and bedding to make a house feel like home.",
    image: img("photo-1556911220-bff31c812dba"),
    tint: "lavender",
    children: [
      { name: "Appliances", slug: "appliances" },
      { name: "Decor", slug: "decor" },
      { name: "Bedding", slug: "bedding" },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Skincare, makeup, fragrance and haircare rituals.",
    image: img("photo-1596462502278-27bfdc403348"),
    tint: "blush",
    children: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Fragrance", slug: "fragrance" },
      { name: "Haircare", slug: "haircare" },
    ],
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Gear for the gym, the trail and the pitch.",
    image: img("photo-1517836357463-d25dfeac3438"),
    tint: "mint",
    children: [
      { name: "Gym & Training", slug: "gym-training" },
      { name: "Outdoor", slug: "outdoor" },
      { name: "Team Sports", slug: "team-sports" },
    ],
  },
  {
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Page-turners, deep dives and the tools to take notes.",
    image: img("photo-1512820790803-83ca734da794"),
    tint: "sky",
    children: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-fiction", slug: "non-fiction" },
      { name: "Stationery", slug: "stationery" },
    ],
  },
];
