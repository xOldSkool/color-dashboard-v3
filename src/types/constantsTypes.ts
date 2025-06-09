export interface FieldBase {
  form: 'input' | 'textarea' | 'select';
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export interface InputField extends FieldBase {
  form: 'input';
  type?: string;
}

export interface CheckboxGroupField extends InputField {
  type: 'checkbox';
  options: string[];
}

export interface TextareaField extends FieldBase {
  form: 'textarea';
}

export interface SelectField extends FieldBase {
  form: 'select';
  options: string[];
}

export type Field = InputField | CheckboxGroupField | TextareaField | SelectField;

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  visibleByDefault_COLS: boolean;
  hideable: boolean;
  type?: string; // 'array' o altro se necessario
}
