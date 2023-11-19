import { APIGatewayProxyEvent } from "aws-lambda";
import { getProductById } from "../get-product-by-id";
import { availableProducts } from "../mocks/products.mock";

jest.mock("../mocks/products.mock", () => ({
  availableProducts: [
    {
      id: "id-1",
      title: "title",
      price: 10,
      description: "description",
      count: 2,
    },
  ],
}));

describe("getProductById", () => {
  it("should return correct successful response", async () => {
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
    expect(response.body).toEqual(
      JSON.stringify({
        id: "id-1",
        title: "title",
        price: 10,
        description: "description",
        count: 2,
      })
    );
  });

  it("should return correct 400 error response", async () => {
    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: undefined,
    };

    const response = await getProductById(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(response.body).toBe("Bad Request");
  });

  it("should return correct 404 error response", async () => {
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
    expect(response.body).toBe(
      "Not Found. There is no product with id nonexisting-product-id"
    );
  });
});
