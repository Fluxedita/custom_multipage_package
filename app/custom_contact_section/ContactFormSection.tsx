import React from 'react';
import type { ContactFormSection } from './types';

export default function ContactFormSection({ section }: { section: ContactFormSection }) {
  return (
    <form action={section.formAction} method={section.formMethod} encType="multipart/form-data">
      {section.fields.map(field => (
        <label key={field.id} style={{ display: 'block', marginBottom: 12 }}>
          {field.label}
          {field.type === 'textarea' ? (
            <textarea name={field.name} required={field.required} placeholder={field.placeholder} />
          ) : (
            <input type={field.type} name={field.name} required={field.required} placeholder={field.placeholder} />
          )}
        </label>
      ))}
      <button type="submit">Send</button>
    </form>
  );
} 