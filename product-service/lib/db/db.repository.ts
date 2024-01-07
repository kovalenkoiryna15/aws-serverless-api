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
import { validateObject } from "../validation/validate-object.util";
import { availableProductSchema } from "../validation/schemas/available-product.schema";

export const dynamoDBClient = new DynamoDBClient({
  region: process.env.CDK_DEFAULT_REGION,
});

export async function putAvailableProductToDB({ id, title, description, price, count, image }: AvailableProduct): Promise<AvailableProduct> {
  const product: Product = {
    id,
    title,
    description,
    price,
    image,
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

  return { id, title, description, price, count, image };
}

export async function updateAvailableProductToDB({ id, title, description, price, count, image }: AvailableProduct): Promise<AvailableProduct> {
  const input: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Update: {
          TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE_NAME,
          Key: marshall({ id }),
          UpdateExpression: 'set #title = :title, #description = :description, #price = :price, #image = :image',
          ExpressionAttributeNames: {
            '#title': 'title',
            '#description': 'description',
            '#price': 'price',
            '#image': 'image',
          },
          ExpressionAttributeValues: marshall({
            ':title': title,
            ':description': description,
            ':price': price,
            ':image': image,
          }),
        }
      },
      {
        Update: {
          TableName: process.env.DYNAMO_DB_STOCKS_TABLE_NAME,
          Key: marshall({ product_id: id }),
          UpdateExpression: 'set #count = :count',
          ExpressionAttributeNames: {
            '#count': 'count',
          },
          ExpressionAttributeValues: marshall({
            ':count': count,
          }),
        }
      },
    ]
  };
  await dynamoDBClient.send(
    new TransactWriteItemsCommand(input)
  );

  return { id, title, description, price, count, image };
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

  const attributes: Partial<AvailableProduct> | undefined= output.Responses?.reduce(
    (acc: Partial<AvailableProduct> | undefined, response: ItemResponse) => 
      response.Item ? ({ ...acc, ...unmarshall(response.Item) }) : acc, {});

  const availableProduct: Partial<AvailableProduct> = {
    id: attributes?.id,
    title: attributes?.title,
    description: attributes?.description,
    price: attributes?.price,
    count: attributes?.count,
    image: attributes?.image,
  };
  const validationErrors: string[] = validateObject<AvailableProduct>(availableProduct, availableProductSchema);

  return validationErrors.length ? null : (availableProduct as AvailableProduct);
}

export async function deleteAvailableProductFromDB(id: string): Promise<void> {
  const input: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Delete: {
          TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE_NAME,
          Key: marshall({ id }),
        }
      },
      {
        Delete: {
          TableName: process.env.DYNAMO_DB_STOCKS_TABLE_NAME,
          Key: marshall({ product_id: id }),
        }
      },
    ]
  };
  await dynamoDBClient.send(
    new TransactWriteItemsCommand(input)
  );
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

  if (!response.Item) {
    return null;
  }

  return unmarshall(response?.Item) as Stock;
}
