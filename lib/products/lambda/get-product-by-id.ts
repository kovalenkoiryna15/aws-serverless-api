import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { availableProducts } from "./mocks/products.mock";
import { AvailableProduct } from "./models/product.model";
import { response } from "./utils/response.util";

export const getProductById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let product: AvailableProduct | undefined;

  if (!event.pathParameters?.product_id) {
    return response(400, "Bad Request");
  }

  product = availableProducts.find(
    ({ id }) => id === event.pathParameters?.product_id
  );

  if (!product) {
    return response(
      404,
      `Not Found. There is no product with id ${event.pathParameters?.product_id}`
    );
  }

  return response(200, product);
};
