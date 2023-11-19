import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

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

    const products = api.root.addResource("products");
    const productsLambdaIntegration = new lambda.Function(
      this,
      "All Products Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib/products"),
        handler: "lambda.getProductsList",
      }
    );
    products.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(productsLambdaIntegration)
    );

    const productById = products.addResource("{product_id}");
    const productByIdLambdaIntegration = new lambda.Function(
      this,
      "Single Product Endpoint",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib/products"),
        handler: "lambda.getProductById",
      }
    );
    productById.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(productByIdLambdaIntegration)
    );
  }
}
