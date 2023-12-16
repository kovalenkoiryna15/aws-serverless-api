import { APIGatewayRequestAuthorizerEvent, AuthResponse } from "aws-lambda";
import { generateAuthResponse, log } from "./utils";

export const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEvent): Promise<AuthResponse> => {
  log('request', event);

  if (event.type !== 'REQUEST') {
    throw new Error('Wrong request type');
  }

  const token = event.headers?.Authorization?.split(' ').pop();

  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Unauthorized');
  }

  const buffer = Buffer.from(token, 'base64');
  const [login, password] = buffer.toString('utf-8').split(':');

  log('info', `login: ${login} password: ${password}`);

  const effect: 'Deny' | 'Allow'  = !process.env[login] || process.env[login] !== password ? 'Deny' : 'Allow';

  return generateAuthResponse(effect, event.methodArn);
};
