import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  DYNAMO_DB_PRODUCTS_TABLE_NAME,
  DYNAMO_DB_STOCKS_TABLE_NAME,
} from "./db/constants/db.constants";

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
    const productsLambdaIntegration = new lambda.Function(
      this,
      "All Products Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib/products"),
        handler: "lambda.getProductsList",
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

    const createProductLambdaIntegration = new lambda.Function(
      this,
      "Create Product Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib/products"),
        handler: "lambda.createProduct",
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
    const productByIdLambdaIntegration = new lambda.Function(
      this,
      "Single Product Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib/products"),
        handler: "lambda.getProductById",
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
  }
}
