import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { response } from "./utils/response.util";
import { putAvailableProductToDB } from "../db/db.repository";
import { AvailableProduct } from "../models/product.model";
import { randomUUID } from "crypto";
import { Schema } from "../validation/schema.model";
import { validateObject } from "../validation/validate-object.util";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";
import { isEmpty } from "./utils/is-empty.util";

export const createProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  log("request", { method: event.httpMethod, body: event.body });

  const promise = async () => {
    if (!event.body) {
      return response(400, "Bad Request. Body should not be empty.");
    }
  
    const { title, description, price, count }: any = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  
    if (isEmpty(title) || isEmpty(description) || isEmpty(price) || isEmpty(count)) {
      return response(400, "Bad Request. Required params are missing. You should provide title, description, price and count.");
    }
  
    const availableProductInput = {
      id: randomUUID(),
      title,
      description,
      price,
      count,
    };
  
    const availableProductSchema: Record<keyof AvailableProduct, Schema> = {
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
  
    const validationErrors: string[] = validateObject<AvailableProduct>(availableProductInput, availableProductSchema);
  
    if (validationErrors.length) {
      return response(400, `Bad Request. Errors: ${validationErrors.join(';')}`);
    }

    await putAvailableProductToDB(availableProductInput);
  
    return response(200, availableProductInput);
  };

  return catchError(promise());
};
