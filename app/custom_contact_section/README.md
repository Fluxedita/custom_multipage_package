# Custom Contact Section

This directory contains the modular, editable ContactFormSection for your project.

- **types.ts**: TypeScript types for the contact form section and fields.
- **utils.ts**: Utility for default fields.
- **ContactFormSectionEditor.tsx**: Admin-facing editor for configuring the contact form section.
- **ContactFormSection.tsx**: Renders the live contact form for end-users.

## How it works
- Essential fields (Name, Email, Message) are always present.
- Admins can add, edit, or remove optional fields (except locked essentials).
- Supports file uploads and all common field types.
- Form action and method are configurable.

---
Extend as needed for your project! 