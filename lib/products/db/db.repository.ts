import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { AvailableProduct, Product, Stock } from "../models/product.model";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DYNAMO_DB_PRODUCTS_TABLE_NAME, DYNAMO_DB_STOCKS_TABLE_NAME } from "./constants/db.constants";

export const dynamoDBClient = new DynamoDBClient({
  region: process.env.CDK_DEFAULT_REGION,
});

export async function getAllProductsFromDB(): Promise<Product[]> {
  const input: ScanCommandInput = {
    TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE_NAME,
  };
  const output: ScanCommandOutput = await dynamoDBClient.send(
    new ScanCommand(input)
  );
  return output?.Items
    ? (output.Items.map((item) => unmarshall(item)) as Product[])
    : [];
}

export async function getProductFromDB(id: string): Promise<Product | null> {
  const input: GetItemCommandInput = {
    TableName: DYNAMO_DB_PRODUCTS_TABLE_NAME,
    Key: marshall({ id }),
  };
  const response: GetItemCommandOutput = await dynamoDBClient.send(
    new GetItemCommand(input)
  );

  if (!response?.Item) {
    return null;
  }

  return unmarshall(response?.Item) as Product;
}

export async function putProductToDB(product: Product): Promise<Product | null> {
  const input: PutItemCommandInput = {
    TableName: DYNAMO_DB_PRODUCTS_TABLE_NAME,
    Item: marshall(product),
  };
  await dynamoDBClient.send(
    new PutItemCommand(input)
  );

  return product;
}

export async function putStockToDB(stock: Stock): Promise<Stock | null> {
  const input: PutItemCommandInput = {
    TableName: DYNAMO_DB_STOCKS_TABLE_NAME,
    Item: marshall(stock),
  };
  await dynamoDBClient.send(
    new PutItemCommand(input)
  );

  return stock;
}

export async function getStockFromDB(id: string): Promise<Stock | null> {
  const input: GetItemCommandInput = {
    TableName: DYNAMO_DB_STOCKS_TABLE_NAME,
    Key: marshall({ product_id: id }),
  };
  const response: GetItemCommandOutput = await dynamoDBClient.send(
    new GetItemCommand(input)
  );

  if (!response?.Item) {
    return null;
  }

  return unmarshall(response?.Item) as Stock;
}

export async function getAvailableProductFromDB(id: string): Promise<AvailableProduct | null> {
  const product: Product | null = await getProductFromDB(id);

  if (!product) {
    return null;
  }

  return getAvailableProduct(product);
}

export async function getAvailableProduct(product: Product): Promise<AvailableProduct> {
  const stock: Stock | null = await getStockFromDB(product.id);

  if (!stock) {
    return { ...product, count: 0 };
  }

  return { ...product, count: stock.count };
}

export async function getAllAvailableProductsFromDB(): Promise<AvailableProduct[]> {
  const products: Product[] = await getAllProductsFromDB();

  return Promise.allSettled(products.map(async (product): Promise<AvailableProduct> => {
    return getAvailableProduct(product);
  })).then((results: PromiseSettledResult<AvailableProduct>[]) => results.reduce(
    (acc: AvailableProduct[], result: PromiseSettledResult<AvailableProduct>) => {
      if (result.status === 'fulfilled') {
        acc.push(result.value);
      }

      if (result.status === 'rejected') {
        console.warn(result.reason);
      }

      return acc;
    }, []
  ));
}
