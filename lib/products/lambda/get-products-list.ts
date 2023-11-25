import { APIGatewayProxyResult } from "aws-lambda";
import { availableProducts } from "./mocks/products.mock";
import { response } from "./utils/response.util";

export const getProductsList = async (): Promise<APIGatewayProxyResult> => {
  return response(200, availableProducts);
};
