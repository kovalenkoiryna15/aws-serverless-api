import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { response } from "./utils/response.util";
import { putAvailableProductToDB } from "../db/db.repository";
import { AvailableProduct } from "../models/product.model";
import { randomUUID } from "crypto";
import { validateObject } from "../validation/validate-object.util";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";
import { isEmpty } from "./utils/is-empty.util";
import { availableProductSchema } from "../validation/schemas/available-product.schema";
import { isValidBody } from "./utils/validate-body.util";

export const createProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  log("request", { method: event.httpMethod, body: event.body });

  const promise = async () => {
    if (!isValidBody(event.body)) {
      return response(400, "Bad Request. Body is not valid json.");
    }

    const { title, description, price, count }: any = event.body;
  
    if (isEmpty(title) || isEmpty(price) || isEmpty(count)) {
      return response(400, "Bad Request. Required params are missing. You should provide title, price and count.");
    }
  
    const availableProductInput = {
      id: randomUUID(),
      title,
      description: isEmpty(description) ? "" : description,
      price,
      count,
    };
  
    const validationErrors: string[] = validateObject<AvailableProduct>(availableProductInput, availableProductSchema);
  
    if (validationErrors.length) {
      return response(400, `Bad Request. Errors: ${validationErrors.join(';')}`);
    }

    await putAvailableProductToDB(availableProductInput);
  
    return response(200, availableProductInput);
  };

  return catchError(promise());
};
