import dotenv from 'dotenv';
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import path from 'path';
import {
  DYNAMO_DB_PRODUCTS_TABLE_NAME,
  DYNAMO_DB_STOCKS_TABLE_NAME,
} from "./db/constants/db.constants";

dotenv.config();

export class ProductsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "Products API", {
      restApiName: "Products",
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    const dbFullAccessRole = new iam.Role(
      this,
      "DynamoDB Lambda Full Access Role",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        roleName: "DynamoDBLambdaFullAccessRole",
      }
    );

    dbFullAccessRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")
    );

    const products = api.root.addResource("products");
    const productsLambdaIntegration = new lambdaNodejs.NodejsFunction(
      this,
      "All Products Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/get-products-list.ts"),
        handler: "getProductsList",
        role: dbFullAccessRole,
        environment: {
          DYNAMO_DB_PRODUCTS_TABLE_NAME: DYNAMO_DB_PRODUCTS_TABLE_NAME,
          DYNAMO_DB_STOCKS_TABLE_NAME: DYNAMO_DB_STOCKS_TABLE_NAME,
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION!,
        },
      }
    );
    products.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(productsLambdaIntegration)
    );

    const createProductLambdaIntegration = new lambdaNodejs.NodejsFunction(
      this,
      "Create Product Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/create-product.ts"),
        handler: "createProduct",
        role: dbFullAccessRole,
        environment: {
          DYNAMO_DB_PRODUCTS_TABLE_NAME: DYNAMO_DB_PRODUCTS_TABLE_NAME,
          DYNAMO_DB_STOCKS_TABLE_NAME: DYNAMO_DB_STOCKS_TABLE_NAME,
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION!,
        },
      }
    );
    products.addMethod(
      lambda.HttpMethod.POST,
      new apigw.LambdaIntegration(createProductLambdaIntegration)
    );

    const productById = products.addResource("{product_id}");
    const productByIdLambdaIntegration = new lambdaNodejs.NodejsFunction(
      this,
      "Single Product Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/get-product-by-id.ts"),
        handler: "getProductById",
        role: dbFullAccessRole,
        environment: {
          DYNAMO_DB_PRODUCTS_TABLE_NAME: DYNAMO_DB_PRODUCTS_TABLE_NAME,
          DYNAMO_DB_STOCKS_TABLE_NAME: DYNAMO_DB_STOCKS_TABLE_NAME,
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION!,
        },
      }
    );
    productById.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(productByIdLambdaIntegration)
    );


    const catalogBatchProcess = new lambdaNodejs.NodejsFunction(
      this,
      "Catalog Batch Process",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/catalog-batch-process.ts"),
        handler: "catalogBatchProcess",
        role: dbFullAccessRole,
        environment: {
          DYNAMO_DB_PRODUCTS_TABLE_NAME: DYNAMO_DB_PRODUCTS_TABLE_NAME,
          DYNAMO_DB_STOCKS_TABLE_NAME: DYNAMO_DB_STOCKS_TABLE_NAME,
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION!,
        },
      }
    );

    const catalogItemsQueue = new sqs.Queue(this, 'Catalog Items Queue');
    catalogItemsQueue.grantConsumeMessages(catalogBatchProcess);

    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, { batchSize: 5, maxBatchingWindow: cdk.Duration.seconds(10) }));
  }
}
