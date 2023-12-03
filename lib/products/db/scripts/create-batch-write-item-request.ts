import * as fs from "fs";
import { getStocks, products as productsMock } from "../../mocks/products.mock";
import { Product, Stock } from "../../models/product.model";
import { resolve } from "path";
import {
  DYNAMO_DB_PRODUCTS_TABLE_NAME,
  DYNAMO_DB_STOCKS_TABLE_NAME,
} from "../constants/db.constants";
import { marshall } from "@aws-sdk/util-dynamodb";
import { randomUUID } from "crypto";

function createBatchWriteItemRequest() {
  const folder = "./lib/products/db/requests";
  const file = "products-batch-write-item-request.json";
  const path = `${folder}`;

  if (!fs.existsSync(path)) {
    const products: Product[] = productsMock.map((product: Product) => ({
      ...product,
      id: randomUUID(),
    }));
  
    const request = {
      [DYNAMO_DB_PRODUCTS_TABLE_NAME]: products.map((product: Product) => ({
        PutRequest: {
          Item: marshall(product),
        },
      })),
      [DYNAMO_DB_STOCKS_TABLE_NAME]: getStocks(products).map((stock: Stock) => ({
        PutRequest: {
          Item: marshall(stock),
        },
      })),
    };

    fs.mkdirSync(path);

    fs.writeFileSync(
      `${resolve(folder)}/${file}`,
      JSON.stringify(request),
      "utf8"
    );
  }
}

createBatchWriteItemRequest();
