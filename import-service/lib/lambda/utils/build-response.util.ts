import { APIGatewayProxyResult } from "aws-lambda";
import { buildHeaders } from "./build-headers.util";

export function buildResponse(statusCode: number, body: any): APIGatewayProxyResult {
  const headers = buildHeaders();
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
