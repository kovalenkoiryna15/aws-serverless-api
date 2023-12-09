import { IncomingMessage } from "http";

export function checkBodyIsIncomingMessage(body: any): body is IncomingMessage {
  return body instanceof IncomingMessage;
}
