import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse, catchError, log } from "./utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Folders } from "./constants";

export const importProductsFile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  log('request', event);

  const promise = async () => {
    if (event.queryStringParameters && 'name' in event.queryStringParameters) {
      const { name } = event.queryStringParameters;
      const s3Client = new S3Client();
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `${Folders.UPLOADED}/${name}`,
      });
      const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });
      return buildResponse(200, { signedUrl });
    }

    return buildResponse(400, 'File name was not provided.');
  };

  return catchError(promise());
}
