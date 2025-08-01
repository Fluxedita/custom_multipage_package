import { v4 as uuid } from 'uuid';
import { FormField } from './types';

export const defaultFields: FormField[] = [
  { id: uuid(), type: 'text', label: 'Name', name: 'name', required: true },
  { id: uuid(), type: 'email', label: 'Email', name: 'email', required: true },
  { id: uuid(), type: 'textarea', label: 'Message', name: 'message', required: true }
]; 