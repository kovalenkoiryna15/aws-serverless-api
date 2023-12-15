import { APIGatewayProxyResult, SQSEvent, SQSRecord } from "aws-lambda";
import { response } from "./utils/response.util";
import { log } from "./utils/logger.util";
import { isValidBody } from "./utils/validate-body.util";
import { isEmpty } from "./utils/is-empty.util";
import { randomUUID } from "node:crypto";
import { validateObject } from "../validation/validate-object.util";
import { AvailableProduct } from "../models/product.model";
import { availableProductSchema } from "../validation/schemas/available-product.schema";
import { putAvailableProductToDB } from "../db/db.repository";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

export const catalogBatchProcess = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  log("request", event.Records.length);
  const sns = new SNSClient();

  return Promise.allSettled(
    event.Records.map(async (record: SQSRecord) => {
      log('info', record.body);

      if (!isValidBody(record.body)) {
        return Promise.reject('Bad Request. Body is not valid json.');
      }
  
      const { title, description, price, count }: any = record.body && JSON.parse(record.body);
    
      if (isEmpty(title) || isEmpty(price) || isEmpty(count)) {
        return Promise.reject("Bad Request. Required params are missing. You should provide title, price and count.");
      }
    
      const availableProductInput = {
        id: randomUUID(),
        title,
        description: isEmpty(description) ? "" : description,
        price,
        count,
      };
    
      const validationErrors: string[] = validateObject<AvailableProduct>(availableProductInput, availableProductSchema);
    
      if (validationErrors.length) {
        return Promise.reject(`Bad Request. Errors: ${validationErrors.join(';')}`);
      }
  
      await putAvailableProductToDB(availableProductInput);

      await sns.send(new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: 'New product was created.',
        MessageAttributes: {
          'price': {
            DataType: 'Number',
            StringValue: String(price),
          },
        },
      }));

      return Promise.resolve(availableProductInput);
    }),
  ).then((results: PromiseSettledResult<AvailableProduct>[]) => {
    let fulfilled: number = 0;
    let rejected: number = 0;

    results.forEach((result: PromiseSettledResult<AvailableProduct>) => {
      if (result.status === 'fulfilled') {
        fulfilled++;
        log('info', result.value);
      }

      if (result.status === 'rejected') {
        rejected++;
        log('error', result.reason);
      }
    });

    return response(200, `Fulfilled: ${fulfilled}. Rejected: ${rejected}`);
  });
};