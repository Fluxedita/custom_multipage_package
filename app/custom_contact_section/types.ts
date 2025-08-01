export type ContactFormSection = {
  id: string;
  type: 'contact-form';
  formAction: string; // destination or function URL
  formMethod: 'POST' | 'GET';
  fields: FormField[];
};

export type FormField = {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'checkbox' | 'file';
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
}; 