import { APIGatewayProxyResult, S3Event } from "aws-lambda";
import { CopyObjectCommand, CopyObjectCommandInput, CopyObjectCommandOutput, DeleteObjectCommand, DeleteObjectCommandInput, GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import csv from "csv-parser";
import { buildResponse, catchError, log } from "./utils";
import { BUCKET_NAME, Folders } from "./constants";
import { checkBodyIsIncomingMessage } from "./utils/check-body-type.util";

export const importFileParser = async (event: S3Event): Promise<APIGatewayProxyResult> => {
  log('request', event);

  const promise = async () => {
    const s3Client = new S3Client();
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key);
    const getObjectCommandInput: GetObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
    };
    const { Body }: GetObjectCommandOutput = await s3Client.send(new GetObjectCommand(getObjectCommandInput));

    if (Body && checkBodyIsIncomingMessage(Body)) {
      const result: any[] = [];

      Body.pipe(csv())
        .on("data", (data: any) => {
          log('info', data, '[Data]');
          result.push(data);
        })
        .on("error", (error: any) => log('error', error))
        .on("end", () => log('info', result, '[Result]'));

      const newObjectKey = objectKey.replace(Folders.UPLOADED, Folders.PARSED);
      const copyObjectCommandInput: CopyObjectCommandInput = {
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${encodeURIComponent(objectKey)}`,
        Key: newObjectKey,
      };

      await s3Client.send(new CopyObjectCommand(copyObjectCommandInput));
      log('info', `File ${objectKey} moved to parsed. New key ${newObjectKey}`);

      const deleteObjectCommandInput: DeleteObjectCommandInput = {
        Bucket: BUCKET_NAME,
        Key: objectKey,
      };

      await s3Client.send(new DeleteObjectCommand(deleteObjectCommandInput));
      log('info', `File ${objectKey} removed from uploaded.`);
    }

    return buildResponse(200, { message: 'Success' });
  }

  return catchError(promise());
}
