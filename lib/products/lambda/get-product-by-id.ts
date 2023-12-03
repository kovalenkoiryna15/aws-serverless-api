import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AvailableProduct } from "../models/product.model";
import { response } from "./utils/response.util";
import { getAvailableProductFromDB } from "../db/db.repository";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";

export const getProductById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  log("request", { method: event.httpMethod, pathParameters: event.pathParameters });

  const promise = async () => {
    let product: AvailableProduct | null;
    const product_id: string | undefined = event.pathParameters?.product_id;
  
    if (!product_id) {
      return response(400, "Bad Request");
    }
  
    product = await getAvailableProductFromDB(product_id);
  
    if (!product) {
      return response(
        404,
        `Not Found. There is no product with id ${event.pathParameters?.product_id}`
      );
    }
  
    return response(200, product);
  };

  return catchError(promise());
};
