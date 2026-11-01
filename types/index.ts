export type VariantDTO = {
  id: string;
  sku: string;
  caseType: string;
  stock: number;
  priceAdjustment: number;
  image: string | null;
  phoneModel: { id: string; name: string; brand: string; series: string; sortOrder: number };
};

export type ProductDTO = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  variants: VariantDTO[];
};

/** What the cart stores in localStorage. Prices/names are display snapshots only;
 *  the server always re-prices from the database at checkout. */
export type CartItem = {
  variantId: string;
  quantity: number;
  productId: string;
  productName: string;
  brand: string;
  modelName: string;
  caseType: string;
  unitPrice: number; // cents
  image: string;
  maxStock: number;
};
