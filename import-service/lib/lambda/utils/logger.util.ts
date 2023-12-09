export function log(type: 'info' | 'error' | 'request', data: any, prefix?: string) {
  switch (type) {
    case 'info':
      logInfo(data, prefix);
      break;
    case 'request':
      logRequest(data);
      break;
    case 'error':
      logError(data);
      break;
    default:
      console.log(`[Log] ${JSON.stringify(data)}`);
  }
}

function logInfo(data: any, prefix: string = '[Log Info]', ) {
  console.info(`${prefix} - ${JSON.stringify(data)}`);
}

function logError(data: any, prefix: string = '[Log Error]') {
  console.error(`${prefix} - ${JSON.stringify(data)}`);
}

function logRequest(data: any) {
  logInfo(data, '[Log Request]');
}
