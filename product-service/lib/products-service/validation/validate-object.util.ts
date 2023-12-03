import { Schema } from "./schema.model";

export function validateObject<T>(obj: any, schema: Record<keyof T, Schema>): string[] {
  const errors: string[] = (Object.keys(schema) as Array<keyof T>).reduce((errors: string[], key: keyof T) => {
    if (schema[key].isRequired && !obj[key]) {
      errors.push(`${String(key)} is required`);
      return errors;
    }

    if (typeof obj[key] !== schema[key].type) {
      errors.push(`${String(key)} should be of type ${schema[key].type}`);
      return errors;
    }

    switch (schema[key].type) {
      case 'string': {
        if (schema[key].maxLength && obj[key].length > schema[key].maxLength!) {
          errors.push(`${String(key)} should have ${schema[key].maxLength} max length`);
        }
        if (schema[key].minLength && obj[key].length < schema[key].minLength!) {
          errors.push(`${String(key)} should have ${schema[key].minLength} min length`);
        }
        break;
      }
      case 'number': {
        if (schema[key].max && obj[key] > schema[key].max!) {
          errors.push(`${String(key)} should be less than ${schema[key].max}`);
        }
        if (schema[key].min && obj[key] < schema[key].min!) {
          errors.push(`${String(key)} should be greater than ${schema[key].min}`);
        }
        break;
      }
    }

    return errors;
  }, []);

  return errors;
}