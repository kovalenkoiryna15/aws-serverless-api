import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ProductsStack } from "../lib/products/products-stack";

test("Products Stack Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ProductsStack(app, "ProductsTestStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "Products",
  });
});
