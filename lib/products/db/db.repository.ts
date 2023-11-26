import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  ItemResponse,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  TransactGetItemsCommand,
  TransactGetItemsCommandInput,
  TransactGetItemsCommandOutput,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from "@aws-sdk/client-dynamodb";
import { AvailableProduct, Product, Stock } from "../models/product.model";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { log } from "../lambda/utils/logger.util";
import { isEmpty } from "../lambda/utils/is-empty.util";

export const dynamoDBClient = new DynamoDBClient({
  region: process.env.CDK_DEFAULT_REGION,
});

export async function putAvailableProductToDB({ id, title, description, price, count }: AvailableProduct): Promise<AvailableProduct | null> {
  const product: Product = {
    id,
    title,
    description,
    price,
  };
  const stock: Stock = {
    product_id: id,
    count,
  };
  const input: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Put: {
          TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE_NAME,
          Item: marshall(product),
        }
      },
      {
        Put: {
          TableName: process.env.DYNAMO_DB_STOCKS_TABLE_NAME,
          Item: marshall(stock),
        }
      },
    ]
  };
  await dynamoDBClient.send(
    new TransactWriteItemsCommand(input)
  );

  return { id, title, description, price, count };
}

export async function getAvailableProductFromDB(id: string): Promise<AvailableProduct | null> {
  const input: TransactGetItemsCommandInput = {
    TransactItems: [
      {
        Get: {
          TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE_NAME,
          Key: marshall({ id }),
        }
      },
      {
        Get: {
          TableName: process.env.DYNAMO_DB_STOCKS_TABLE_NAME,
          Key: marshall({ product_id: id }),
        }
      },
    ]
  };
  const output: TransactGetItemsCommandOutput = await dynamoDBClient.send(
    new TransactGetItemsCommand(input)
  );

  const availableProduct: any = output.Responses?.reduce((acc, response: ItemResponse) => response.Item ? ({ ...acc, ...unmarshall(response.Item) }) : acc, {});

  return isEmpty(availableProduct) ? null: availableProduct;
}

export async function getAllAvailableProductsFromDB(): Promise<AvailableProduct[]> {
  const products: Product[] = await getAllProductsFromDB();

  return products.length
    ? Promise.allSettled(
      products
        .map(async (product): Promise<AvailableProduct> => getAvailableProduct(product)))
          .then((results: PromiseSettledResult<AvailableProduct>[]) => results.reduce(
              (acc: AvailableProduct[], result: PromiseSettledResult<AvailableProduct>) => {
                if (result.status === 'fulfilled') {
                  acc.push(result.value);
                }

                if (result.status === 'rejected') {
                  log('error', result.reason);
                }

                return acc;
              }, []
            ),
          )
    : [];
}

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

export async function getAvailableProduct(product: Product): Promise<AvailableProduct> {
  const stock: Stock | null = await getStockFromDB(product.id);

  if (!stock) {
    return { ...product, count: 0 };
  }

  return { ...product, count: stock.count };
}

export async function getStockFromDB(id: string): Promise<Stock | null> {
  const input: GetItemCommandInput = {
    TableName: process.env.DYNAMO_DB_STOCKS_TABLE_NAME,
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
