import { APIGatewayProxyResult } from "aws-lambda";
import { log } from "./logger.util";

export async function catchError(promise: Promise<APIGatewayProxyResult>): Promise<APIGatewayProxyResult> {
  return promise.catch((error: any) => {
    const data: any = { message: error.message };
  
    if (error.code) {
      data.code = error.code
    }

    log("error", data);

    return {
      statusCode: 500,
      body: 'Server Error.',
    };
  });
}