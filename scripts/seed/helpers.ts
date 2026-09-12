export type SeedVariant = {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number;
  stock: number;
};

export type SeedProduct = {
  title: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  images: string[];
  variantAxes: string[];
  variants: SeedVariant[];
  tags?: string[];
  isFeatured?: boolean;
  isDeal?: boolean;
};

export function img(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export function single(sku: string, price: number, mrp: number, stock = 40): SeedVariant[] {
  return [{ sku, attributes: {}, price, mrp, stock }];
}

export function axis(
  skuBase: string,
  name: string,
  values: string[],
  price: number,
  mrp: number,
  stocks?: number[],
  priceStep = 0,
): SeedVariant[] {
  return values.map((value, i) => ({
    sku: `${skuBase}-${code(value)}`,
    attributes: { [name]: value },
    price: price + priceStep * i,
    mrp: mrp + priceStep * i,
    stock: stocks?.[i] ?? 25,
  }));
}

export function matrix(
  skuBase: string,
  axes: [string, string[]][],
  price: number,
  mrp: number,
  stockFor?: (attrs: Record<string, string>) => number,
): SeedVariant[] {
  const [[aName, aValues], [bName, bValues]] = axes as [[string, string[]], [string, string[]]];
  const out: SeedVariant[] = [];
  for (const a of aValues) {
    for (const b of bValues) {
      const attributes = { [aName]: a, [bName]: b };
      out.push({
        sku: `${skuBase}-${code(a)}-${code(b)}`,
        attributes,
        price,
        mrp,
        stock: stockFor ? stockFor(attributes) : 18,
      });
    }
  }
  return out;
}

function code(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase()
    .slice(0, 6);
}

export const SIZES = ["S", "M", "L", "XL"];
export const SHOE_SIZES = ["UK 7", "UK 8", "UK 9", "UK 10"];
