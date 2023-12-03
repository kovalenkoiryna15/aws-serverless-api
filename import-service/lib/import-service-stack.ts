import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { BUCKET_ARN, BUCKET_NAME, Folders } from './lambda/constants';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "Import API", {
      restApiName: "Import API",
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });
  
    const apiChildResource = api.root.addResource("import");

    const bucket = s3.Bucket.fromBucketArn(this, "Import Products Bucket", BUCKET_ARN);
  
    const importProductsFile = new lambda.Function(
      this,
      "Import Products File",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib"),
        handler: "lambda.importProductsFile",
        environment: {
          BUCKET_NAME: BUCKET_NAME,
        },
      }
    );

    bucket.grantReadWrite(importProductsFile); // ? Write
  
    apiChildResource.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          'method.request.querystring.name': true
        },
      }
    );

    const importFileParser = new lambda.Function(
      this,
      "Import File Parser",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib"),
        handler: "lambda.importFileParser",
      }
    );

    bucket.grantRead(importFileParser);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: `${Folders.UPLOADED}/*` },
    );
  }
}
