import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AvailableProduct } from "../models/product.model";
import { response } from "./utils/response.util";
import { getAvailableProductFromDB, updateAvailableProductToDB } from "../db/db.repository";
import { catchError } from "./utils/error-handler.util";
import { log } from "./utils/logger.util";
import { isValidBody } from "./utils/validate-body.util";
import { isEmpty } from "./utils/is-empty.util";
import { validateObject } from "../validation/validate-object.util";
import { availableProductSchema } from "../validation/schemas/available-product.schema";

export const updateProduct = async (
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

    if (!isValidBody(event.body)) {
      return response(400, "Bad Request. Body is not valid json.");
    }

    const { title, description, price, count, image }: any = event.body && JSON.parse(event.body);
  
    if (isEmpty(title) || isEmpty(price) || isEmpty(count)) {
      return response(400, "Bad Request. Required params are missing. You should provide title, price and count.");
    }
  
    const availableProductInput = {
      id: product.id,
      title,
      description: isEmpty(description) ? "" : description,
      price,
      count,
      image: image || 'https://rss-products-assets.s3.eu-west-1.amazonaws.com/default.jpg',
    };
  
    const validationErrors: string[] = validateObject<AvailableProduct>(availableProductInput, availableProductSchema);
  
    if (validationErrors.length) {
      return response(400, `Bad Request. Errors: ${validationErrors.join(';')}`);
    }

    await updateAvailableProductToDB(availableProductInput);
  
    return response(200, availableProductInput);
  };

  return catchError(promise());
};
