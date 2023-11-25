export function isEmpty(value: any) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}
