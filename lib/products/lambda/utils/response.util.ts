import { APIGatewayProxyResult } from "aws-lambda";
import * as headersUtils from "./response-headers.util";

export function response(
  statusCode: number,
  responseBody: any
): APIGatewayProxyResult {
  const headers = headersUtils.headers();
  const response: APIGatewayProxyResult = {
    statusCode,
    headers,
    body: "",
  };

  if (typeof responseBody !== "string") {
    try {
      response.body =
        typeof responseBody !== "string"
          ? JSON.stringify(responseBody)
          : responseBody;
    } catch (error) {
      response.statusCode = 500;
      response.body = "Server error";
    }
  }

  return response;
}
