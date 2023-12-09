import { APIGatewayProxyEvent } from "aws-lambda";
import { importProductsFile } from "../lib/lambda";
import { config } from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('url')
}));

config();

describe("importProductsFile", () => {
  it("should call getSignedUrl and return correct response", async () => {
    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      queryStringParameters: {
        name: 'products.csv'
      },
    };

    const response = await importProductsFile(fakeEvent as APIGatewayProxyEvent);

    expect(getSignedUrl).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).signedUrl).toEqual('url');
  });

  it("should return 'Bad Request' error if 'name' parameter was not provided", async () => {
    const fakeEvent: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      queryStringParameters: {},
    };

    const response = await importProductsFile(fakeEvent as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).message).toEqual('File name was not provided.');
  });
});
