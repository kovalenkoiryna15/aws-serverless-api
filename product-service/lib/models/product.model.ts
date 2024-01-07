export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface AvailableProduct extends Product {
  count: number;
}

export interface Stock {
  product_id: string;
  count: number;
}
