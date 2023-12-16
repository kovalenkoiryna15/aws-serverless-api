import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import { join } from 'path';
import { config } from 'dotenv';

config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambdaNodejs.NodejsFunction(
      this,
      "Basic Authorizer",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: join(__dirname, "./lambda/basic-authorizer.ts"),
        handler: "basicAuthorizer",
        environment: {
          kovalenkoiryna15: process.env.TEST_PASSWORD!
        },
      }
    );
  }
}
