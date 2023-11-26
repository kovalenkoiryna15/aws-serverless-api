export function isValidBody(body: any): boolean {
  if (!body) {
    return false;
  }

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
      return true;
    } catch(error) {
      return false;
    }
  } 
  return false;
}