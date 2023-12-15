import { APIGatewayProxyEvent } from "aws-lambda";
import { getProductById } from "../../lib/lambda/get-product-by-id";
import * as dbRepository from "../../lib/db/db.repository";
import { AvailableProduct } from "../../lib/models/product.model";

jest.mock("../../lib/lambda/utils/logger.util");

describe("getProductById", () => {
  const fakeAvailableProduct: AvailableProduct = {
    id: "id-1",
    title: "title",
    price: 10,
    description: "description",
    count: 2,
  };

  it("should return correct successful response", async () => {
    jest.spyOn(dbRepository, 'getAvailableProductFromDB').mockResolvedValue(fakeAvailableProduct);

    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {
        product_id: "id-1",
      },
    };

    const response = await getProductById(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(response.body).toEqual(JSON.stringify(fakeAvailableProduct));
  });

  it("should return correct 400 error response", async () => {
    jest.spyOn(dbRepository, 'getAvailableProductFromDB').mockResolvedValue(fakeAvailableProduct);

    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: undefined,
    };

    const response = await getProductById(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).message).toBe("Bad Request");
  });

  it("should return correct 404 error response", async () => {
    jest.spyOn(dbRepository, 'getAvailableProductFromDB').mockResolvedValue(null);

    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {
        product_id: "nonexisting-product-id",
      },
    };

    const response = await getProductById(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(404);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).message).toBe(
      "Not Found. There is no product with id nonexisting-product-id"
    );
  });
});
