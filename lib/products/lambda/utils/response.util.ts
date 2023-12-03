import { APIGatewayProxyResult } from "aws-lambda";
import * as headersUtils from "./response-headers.util";

export function response(statusCode: number, body: any): APIGatewayProxyResult {
  const headers = headersUtils.headers();
  const response: APIGatewayProxyResult = {
    statusCode,
    headers,
    body,
  };

  if (typeof body !== "string") {
    response.body = JSON.stringify(body)
  } else {
    response.body = JSON.stringify({ message: body });
  }

  return response;
}
