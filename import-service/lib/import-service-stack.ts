import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BUCKET_ARN, BUCKET_NAME } from './lambda/constants';

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

    const lambdaS3AccessRole = new iam.Role(this, "S3 Access Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "S3LambdaAccessRole",
    });

    const bucket = s3.Bucket.fromBucketArn(this, "Import Products Bucket", BUCKET_ARN);
    bucket.grantReadWrite(lambdaS3AccessRole);
  
    const importProductsFile = new lambda.Function(
      this,
      "Import Products File",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lib"),
        handler: "lambda.importProductsFile",
        role: lambdaS3AccessRole,
        environment: {
          BUCKET_NAME: BUCKET_NAME,
        },
      }
    );
  
    apiChildResource.addMethod(
      lambda.HttpMethod.GET,
      new apigw.LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          'method.request.querystring.name': true
        },
      }
    );
  }
}
