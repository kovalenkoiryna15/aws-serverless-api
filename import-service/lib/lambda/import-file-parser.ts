import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./utils";

export const importFileParser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return buildResponse(200, event);
}