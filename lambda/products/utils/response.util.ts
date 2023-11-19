import { headers } from "./response-headers.util";

export function response(statusCode: number, body: any) {
  return {
    statusCode,
    headers: headers(),
    body: JSON.stringify(body),
  };
}
