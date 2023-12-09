import { APIGatewayProxyResult, S3Event } from "aws-lambda";
import { CopyObjectCommand, CopyObjectCommandInput, DeleteObjectCommand, DeleteObjectCommandInput, GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";
import csv from "csv-parser";
import { buildResponse, catchError, log } from "./utils";
import { Folders } from "./constants";
import { checkBodyIsIncomingMessage } from "./utils/check-body-type.util";

export const importFileParser = async (event: S3Event): Promise<APIGatewayProxyResult> => {
  log('request', event);

  const promise = async () => {
    const s3Client = new S3Client();
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key);
    const getObjectCommandInput: GetObjectCommandInput = {
      Bucket: process.env.BUCKET_NAME!,
      Key: objectKey,
    };
    const { Body }: GetObjectCommandOutput = await s3Client.send(new GetObjectCommand(getObjectCommandInput));

    if (Body && checkBodyIsIncomingMessage(Body)) {
      const sqs = new SQSClient();
      const promises: Promise<SendMessageCommandOutput>[] = [];

      await new Promise<void>((resolve, reject) => {
        Body.pipe(csv({
          mapValues: ({ header, index, value, }) => value,
        }))
          .on("data", (data: any) => {
            const promise: Promise<SendMessageCommandOutput> = sqs.send(new SendMessageCommand({
              QueueUrl: process.env.QUEUE_URL,
              MessageBody: JSON.stringify(data),
            }));
            promises.push(promise);
          })
          .on("end", () => {
            resolve();
          })
          .on("error", (error: any) => reject(error.message));
      });

      await Promise.all(promises);

      const newObjectKey = objectKey.replace(Folders.UPLOADED, Folders.PARSED);
      const copyObjectCommandInput: CopyObjectCommandInput = {
        Bucket: process.env.BUCKET_NAME!,
        CopySource: `${process.env.BUCKET_NAME!}/${encodeURIComponent(objectKey)}`,
        Key: newObjectKey,
      };

      await s3Client.send(new CopyObjectCommand(copyObjectCommandInput));
      log('info', `File ${objectKey} moved to parsed. New key ${newObjectKey}`);

      const deleteObjectCommandInput: DeleteObjectCommandInput = {
        Bucket: process.env.BUCKET_NAME!,
        Key: objectKey,
      };

      await s3Client.send(new DeleteObjectCommand(deleteObjectCommandInput));
      log('info', `File ${objectKey} removed from uploaded.`);

      return buildResponse(200, { message: 'Success' });
    }

    return buildResponse(500, { message: 'Server Error.' });
  }

  return catchError(promise());
}
