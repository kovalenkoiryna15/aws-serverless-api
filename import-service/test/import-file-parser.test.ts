import { S3Event, S3EventRecord } from "aws-lambda";
import { importFileParser } from "../lib/lambda";
import { IncomingMessage } from "http";
import { Socket } from "node:net";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ Body: new IncomingMessage(new Socket()) }),
  })),
  GetObjectCommand: jest.fn(),
  CopyObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

describe("importFileParser", () => {
  it("should return correct response", async () => {
    const fakeEvent: Partial<S3Event> = {
      Records: [{
        s3: {
          object: {
            key: 'products.csv'
          } 
        } 
      } as unknown as S3EventRecord, ],
    };

    const response = await importFileParser(fakeEvent as S3Event);

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("*");
    expect(response.headers?.["Access-Control-Allow-Credentials"]).toBe(true);
    expect(JSON.parse(response.body).message).toEqual('Success');
  });

  it("should call GetObjectCommand", async () => {
    const fakeEvent: Partial<S3Event> = {
      Records: [{
        s3: {
          object: {
            key: 'products.csv'
          } 
        } 
      } as unknown as S3EventRecord, ],
    };

    await importFileParser(fakeEvent as S3Event);

    expect(GetObjectCommand).toHaveBeenCalled();
  });

  it("should call CopyObjectCommand", async () => {
    const fakeEvent: Partial<S3Event> = {
      Records: [{
        s3: {
          object: {
            key: 'products.csv'
          } 
        } 
      } as unknown as S3EventRecord, ],
    };

    await importFileParser(fakeEvent as S3Event);

    expect(CopyObjectCommand).toHaveBeenCalled();
  });

  it("should call DeleteObjectCommand", async () => {
    const fakeEvent: Partial<S3Event> = {
      Records: [{
        s3: {
          object: {
            key: 'products.csv'
          } 
        } 
      } as unknown as S3EventRecord, ],
    };

    await importFileParser(fakeEvent as S3Event);

    expect(DeleteObjectCommand).toHaveBeenCalled();
  });
});
