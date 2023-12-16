import { AuthResponse } from "aws-lambda";

export function generateAuthResponse(Effect: 'Allow' | 'Deny', Resource: string): AuthResponse {
  return {
    principalId: 'user',
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect,
          Resource,
        },
      ],
    },
  };
}