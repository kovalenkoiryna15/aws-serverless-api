import { AvailableProduct } from "../../models/product.model";
import { Schema } from "../schema.model";

export const availableProductSchema: Record<keyof AvailableProduct, Schema> = {
  id: {
    type: 'string',
    isRequired: true,
  },
  title: {
    type: 'string',
    isRequired: true,
    maxLength: 200,
    minLength: 1,
  },
  description: {
    type: 'string',
    isRequired: true,
    maxLength: 200,
    minLength: 1,
  },
  price: {
    type: 'number',
    isRequired: true,
    max: 1000000,
    min: 1,
  },
  count: {
    type: 'number',
    isRequired: true,
    max: 1000000,
    min: 1,
  },
};