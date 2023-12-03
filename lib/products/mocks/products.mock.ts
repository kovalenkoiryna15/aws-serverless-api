import { AvailableProduct, Stock } from "../models/product.model";
import { Product } from "../models/product.model";

export const products: Product[] = [
  {
    description:
      "Like all Kenyan coffees, our Kiringa has a clean, fruity flavour and a subtle sweetness.",
    id: "kenya-kiringa",
    price: 20,
    title: "Kenya Kiringa Coffee",
  },
  {
    description:
      "Drip Coffee Blend is a mix of the highest quality beans from different parts of the world. ",
    id: "drip-blend",
    price: 11,
    title: "Drip Coffee Blend",
  },
  {
    description:
      "The beans of this coffee are a carefully selected blend of Arabica beans from the Colombian Cauca region. ",
    id: "decaf-colombia-cauca",
    price: 12,
    title: "Decaf Colombia Cauca Espresso",
  },
  {
    description:
      "Delicious autumnal flavours and aromas wrapped up in a coffee bag - pleasantly tart red currant reminiscent of summer, juicy pomegranate and lots of sweetness tasting of honey and milk chocolate.",
    id: "fall-espresso",
    price: 14,
    title: "Fall Espresso",
  },
  {
    description:
      "More beans from Ethiopia - another temptation for the senses...",
    id: "ethiopia-yirga-beloya",
    price: 15,
    title: "Ethiopia Yirga Beloya",
  },
  {
    description:
      "Meet our latest filter COSTA RICA coffee from the Las Lajas farm, which comes from a semi-washed process, which is an intermediate method between washed and natural processing.",
    id: "costa-rica-las-lajas",
    price: 16,
    title: "Costa Rica Las Lajas",
  },
];

export function getAvailableProducts(products: Product[]): AvailableProduct[] {
  return products.map((product, index) => ({ ...product, count: index + 1 }));
}

export function getStocks(products: Product[]): Stock[] {
  return getAvailableProducts(products).map(({ id, count }) => ({
    product_id: id,
    count,
  }));
}
