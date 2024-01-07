import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { response } from "./utils/response.util";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";
import { deleteAvailableProductFromDB, getAvailableProductFromDB } from "../db/db.repository";

export const deleteProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  log("request", { method: event.httpMethod, pathParameters: event.pathParameters });

  const promise = async () => {
    const product_id: string | undefined = event.pathParameters?.product_id;
  
    if (!product_id) {
      return response(400, "Bad Request");
    }

    const product = await getAvailableProductFromDB(product_id);
  
    if (!product) {
      return response(
        404,
        `Not Found. There is no product with id ${event.pathParameters?.product_id}`
      );
    }
  
    await deleteAvailableProductFromDB(product_id);
  
    return response(200, 'Success');
  };

  return catchError(promise());
};
