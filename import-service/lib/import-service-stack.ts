import dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Folders } from './lambda/constants';
import path from 'path';

dotenv.config();

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "Import API", {
      restApiName: "Import API",
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: apigw.Cors.ALL_METHODS,
        allowCredentials: true
      },
    });

    new apigw.GatewayResponse(this, 'AccessDeniedResponse', {
      restApi: api,
      type: apigw.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
      statusCode: '403',
    });

    new apigw.GatewayResponse(this, 'UnauthorizedResponse', {
      restApi: api,
      type: apigw.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
      statusCode: '401',
    });
  
    const apiChildResource = api.root.addResource("import");

    const bucket = s3.Bucket.fromBucketArn(this, "Import Products Bucket", process.env.BUCKET_ARN!);
  
    const importProductsFile = new lambdaNodejs.NodejsFunction(
      this,
      "Import Products File",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/import-products-file.ts"),
        handler: "importProductsFile",
        environment: {
          BUCKET_NAME: process.env.BUCKET_NAME!,
        },
      }
    );

    const basicAuthorizer = lambda.Function.fromFunctionArn(
      this,
      "BasicAuthorizer",
      process.env.BASIC_AUTHORIZER_ARN!
    );

    const invokeAuthoriserRole = new iam.Role(this, "Role", {
      roleName: "InvokeAuthoriserRole",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        InvokeTokenAuthoriserPolicy: new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [basicAuthorizer.functionArn],
            actions: ["lambda:InvokeFunction"],
          })]
        })
      }
    });

    const importAuthorizer = new apigw.RequestAuthorizer(this, "ImportAuthorizer", {
      handler: basicAuthorizer,
      identitySources: [apigw.IdentitySource.header('Authorization')],
      assumeRole: invokeAuthoriserRole,
    });
  
    apiChildResource.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          'method.request.querystring.name': true
        },
        authorizer: importAuthorizer,
      }
    );

    const importFileParser = new lambdaNodejs.NodejsFunction(
      this,
      "Import File Parser",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "./lambda/import-file-parser.ts"),
        handler: "importFileParser",
        environment: {
          QUEUE_URL: process.env.QUEUE_URL!,
          BUCKET_NAME: process.env.BUCKET_NAME!,
        },
      }
    );

    importFileParser.addPermission('AllowS3Invocation', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('s3.amazonaws.com'),
      sourceArn: process.env.BUCKET_ARN!,
    });

    bucket.grantReadWrite(importFileParser);
    bucket.grantDelete(importFileParser);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: `${Folders.UPLOADED}/`, suffix: 'csv' },
    );

    const catalogItemsQueue = sqs.Queue.fromQueueArn(this, 'Catalog Items Queue', process.env.QUEUE_ARN!);
    catalogItemsQueue.grantSendMessages(importFileParser);
  }
}
