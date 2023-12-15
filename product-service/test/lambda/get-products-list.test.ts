import { APIGatewayProxyEvent } from "aws-lambda";
import { getProductsList } from "../../lib/lambda/get-products-list";
import dotenv from "dotenv";
import * as dbRepository from "../../lib/db/db.repository";

dotenv.config();

jest.mock("../../lib/lambda/utils/logger.util");

describe("getProductsList", () => {
  beforeAll(() => {
    jest.spyOn(dbRepository, 'getAllAvailableProductsFromDB').mockResolvedValue([]);
  });

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
