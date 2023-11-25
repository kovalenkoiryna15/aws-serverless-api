export interface Schema {
  type: 'string' | 'number' | 'object';
  isRequired: boolean;
  maxLength?: number; // use for string
  minLength?: number; // use for string
  max?: number; // use for number
  min?: number; // use for number
}