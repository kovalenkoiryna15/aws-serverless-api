import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ImportServiceStack } from '../lib/import-service-stack';

test('Import Service Stack Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ImportServiceStack(app, "ImportServiceStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "Import API",
  });
});
