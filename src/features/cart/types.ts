export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number;
  qty: number;
  stock: number;
  savedForLater: boolean;
};

export type CartTotals = {
  subtotal: number;
  mrpTotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  total: number;
  itemCount: number;
  freeShippingRemaining: number;
};

export type CartCoupon = {
  code: string;
  description: string;
  discount: number;
  freeShipping: boolean;
} | null;

export type CartDto = {
  id: string | null;
  lines: CartLine[];
  saved: CartLine[];
  coupon: CartCoupon;
  couponError: string | null;
  totals: CartTotals;
};

export const emptyCart: CartDto = {
  id: null,
  lines: [],
  saved: [],
  coupon: null,
  couponError: null,
  totals: {
    subtotal: 0,
    mrpTotal: 0,
    discount: 0,
    couponDiscount: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    freeShippingRemaining: 0,
  },
};
