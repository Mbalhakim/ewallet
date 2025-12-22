export interface PresentationDefinition {
  id: string;
  input_descriptors: InputDescriptor[];
}

export interface InputDescriptor {
  id: string;
  name?: string;
  purpose?: string;
  format?: object;
  constraints: Constraints;
}

export interface Constraints {
  limit_disclosure?: 'required' | 'preferred';
  fields: Field[];
}

export interface Field {
  path: string[];
  id?: string;
  purpose?: string;
  name?: string;
  filter?: Filter;
  optional?: boolean;
}

export interface Filter {
  type:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'null'
    | 'undefined'
    | 'symbol';
  pattern: string;
}
