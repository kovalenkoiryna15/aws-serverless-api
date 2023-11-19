import { availableProducts } from './mocks/products.mock';
import { response } from './utils/response.util';

export const getProductsList = async () => {
  return response(200, availableProducts);
};


