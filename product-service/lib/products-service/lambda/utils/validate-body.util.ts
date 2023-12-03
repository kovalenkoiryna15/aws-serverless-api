export function isValidBody(requestBody: any): boolean {
  let body = requestBody;

  if (!body) {
    return false;
  }

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return false;
      }
      return true;
    } catch(error) {
      return false;
    }
  } 
  return false;
}