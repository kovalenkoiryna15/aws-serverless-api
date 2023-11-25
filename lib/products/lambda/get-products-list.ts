import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { response } from "./utils/response.util";
import { getAllAvailableProductsFromDB } from "../db/db.repository";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";

export const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  log("request", { method: event.httpMethod, params: event.queryStringParameters });

  const promise = async () => {
    const results = await getAllAvailableProductsFromDB();
    return response(200, results);
  };
  return catchError(promise());
};
