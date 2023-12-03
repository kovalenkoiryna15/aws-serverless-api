import { APIGatewayProxyEvent } from "aws-lambda";
import { getProductsList } from "../get-products-list";

describe("getProductsList", () => {
  it("should return correct response", async () => {
    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      body: null,
    };

    const response = await getProductsList(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(response.body).toBeTruthy();
  });
});
