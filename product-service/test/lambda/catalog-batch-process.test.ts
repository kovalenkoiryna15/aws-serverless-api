import { SQSEvent, SQSRecord } from "aws-lambda";
import { catalogBatchProcess } from "../../lib/lambda/catalog-batch-process";
import { AvailableProduct } from "../../lib/models/product.model";
import { putAvailableProductToDB } from "../../lib/db/db.repository";
import { PublishCommand, PublishCommandInput } from '@aws-sdk/client-sns';
import dotenv from "dotenv";

dotenv.config();

const mockSend = jest.fn().mockReturnValue(Promise.resolve());
function mockSNSClient() {
  return { send: mockSend };
};
const mockPublishCommandInput: PublishCommandInput = {
  Message: 'message'
};
function mockPublishCommand() {
  return mockPublishCommandInput;
};

jest.mock("../../lib/lambda/utils/logger.util");

jest.mock("@aws-sdk/client-sns", () => ({
  SNSClient: mockSNSClient,
  PublishCommand: mockPublishCommand,
}));

jest.mock("node:crypto", () => ({
  randomUUID: jest.fn().mockReturnValue('id'),
}));

jest.mock("../../lib/db/db.repository");

describe("catalogBatchProcess", () => {
  let mockPutAvailableProductToDB = jest.mocked(putAvailableProductToDB);

  const fakeProductOne: Omit<AvailableProduct, 'id'> = {
    title: 't-1',
    description: 'd-1',
    price: 100,
    count: 10,
  };
  const fakeProductTwo: Omit<AvailableProduct, 'id'> = {
    title: 't-2',
    description: 'd-2',
    price: 200,
    count: 20,
  };
  const fakeAvailableProductOne: AvailableProduct = { ...fakeProductOne, id: 'id' };
  const fakeAvailableProductTwo: AvailableProduct = { ...fakeProductTwo, id: 'id' };
  const fakeEvent: SQSEvent = {
    Records: [
      { body: JSON.stringify(fakeProductOne) } as SQSRecord,
      { body: JSON.stringify(fakeProductTwo) } as SQSRecord,
    ],
  };

  beforeEach(() => {
    mockPutAvailableProductToDB
      .mockReturnValueOnce(Promise.resolve(fakeAvailableProductOne))
      .mockReturnValueOnce(Promise.resolve(fakeAvailableProductTwo));
  })

  afterEach(() => {
    mockSend.mockClear();
    mockPutAvailableProductToDB.mockClear();
  });

  it("should return correct successful response", async () => {
    const response = await catalogBatchProcess(fakeEvent);

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).message).toEqual(`Fulfilled: ${fakeEvent.Records.length}. Rejected: 0`);
  });

  it("should add products to db table", async () => {
    await catalogBatchProcess(fakeEvent);

    expect(mockPutAvailableProductToDB).toHaveBeenCalledWith(fakeAvailableProductOne);
    expect(mockPutAvailableProductToDB).toHaveBeenCalledWith(fakeAvailableProductTwo);
  });

  it("should publish notifications to SNS", async () => {
    PublishCommand;
    await catalogBatchProcess(fakeEvent);

    expect(mockSend).toHaveBeenCalledTimes(fakeEvent.Records.length);
    expect(mockSend).toHaveBeenCalledWith(mockPublishCommandInput);
  });
});