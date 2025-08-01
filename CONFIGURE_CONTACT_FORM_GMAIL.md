# 📧 Configure Contact Form Component for Gmail

This guide walks you through setting up your contact form to send emails (with attachments) using your own Gmail account.

---

## 1. Set Up a Gmail App Password

1. **Enable 2-Step Verification** on your Gmail account:  
   [Google Account Security](https://myaccount.google.com/security)
2. **Generate an App Password:**  
   - Go to "App passwords" in your Google Account Security settings.
   - Select "Mail" as the app and "Other" (name it e.g. "Nodemailer").
   - Copy the 16-character password Google generates (you’ll use it below).
   ## Visit https://accounts.google.com/v3/signin/confirmidentifier?authuser=0&continue=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&followup=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&ifkv=AdBytiNDFwqPBJGN-Mplb-V6JMHQUSfRXXlWbFt4IzShgrgDRAC_Yx5oD0Ul0Oe70gqdo4J5xdC_eg&osid=1&passive=1209600&rart=ANgoxcdzSMeY0avoxVsjJZchWnlb32Y3bwP9Mx4Hns4JI2csXjmxplmOwqce-x-Fl9NNVX9tEIGlQfeAmGfBSOJgbsX4dZDbwExgUuemnCmpEX9Aij5-6LA&service=accountsettings&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S1278797679%3A1752137990576369 when logged into your gmail account.


---

## 2. Update Your Environment Variables

1. In your project root, open or create `.env.local`.
2. Add:
   ```
   GMAIL_APP_PASSWORD=your_16_character_app_password_here
   ```
   *(Do not use your main Gmail password!)*

---

## 3. Update the Email Address in the API Route

1. Open `app/api/contact/route.ts`.
2. Find:
   ```ts
   const OWNER_EMAIL = 'yourgmail@gmail.com'; // Your Gmail address
   ```
3. Replace with your own Gmail address.

---

## 4. Install Required Packages

```bash
npm install nodemailer formidable
npm install --save-dev @types/formidable
```

---

## 5. Verify the API Route Code

Your `app/api/contact/route.ts` should look like this (key parts shown):

```ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import formidable from 'formidable';
import fs from 'fs';
import type { Fields, Files } from 'formidable';

export const config = {
  api: { bodyParser: false },
};

const OWNER_EMAIL = 'yourgmail@gmail.com'; // <-- Your Gmail address

async function parseForm(req: Request): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: true, keepExtensions: true });
  const buffers = [];
  for await (const chunk of req.body as any) {
    buffers.push(chunk);
  }
  const buffer = Buffer.concat(buffers);
  return await new Promise((resolve, reject) => {
    form.parse(
      // @ts-ignore
      { ...req, headers: req.headers, url: req.url, method: req.method, socket: req.socket, body: buffer },
      (err: any, fields: Fields, files: Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      }
    );
  });
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    if (!fields.name || !fields.email || !fields.message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const attachments = [];
    if (files.profileImage) {
      const file = Array.isArray(files.profileImage) ? files.profileImage[0] : files.profileImage;
      attachments.push({
        filename: file.originalFilename || 'attachment',
        content: fs.createReadStream(file.filepath),
      });
    }
    if (files.profileVideo) {
      const file = Array.isArray(files.profileVideo) ? files.profileVideo[0] : files.profileVideo;
      attachments.push({
        filename: file.originalFilename || 'attachment',
        content: fs.createReadStream(file.filepath),
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: OWNER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Contact Form" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `New Contact Form Submission from ${fields.name}`,
      html: `<h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fields.name}</p>
        <p><strong>Email:</strong> ${fields.email}</p>
        <p><strong>Message:</strong><br/>${fields.message}</p>`,
      replyTo: fields.email,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
```

---

## 6. Update the Frontend Form Submission

In `components/contact/ContactForm.tsx`, ensure the form submission uses `FormData` and sends files:

```js
const formDataToSend = new FormData();
formDataToSend.append('name', formData.name);
formDataToSend.append('email', formData.email);
formDataToSend.append('message', formData.message);

if (profileImage) {
  formDataToSend.append('profileImage', profileImage);
}
if (profileVideo) {
  formDataToSend.append('profileVideo', profileVideo);
}

const response = await fetch('/api/contact', {
  method: 'POST',
  body: formDataToSend,
});
```

---

## 7. Restart Your Dev Server

After changing `.env.local` or installing new packages:

```bash
npm run dev
```

---

## 8. Test the Contact Form

- Fill out the form and submit.
- Check your Gmail inbox (and spam folder) for the email.
- Try attaching an image and/or video to confirm attachments work.

---

## 9. Troubleshooting

- **No email received?** Check your server logs for errors.
- **Authentication error?** Double-check your app password and Gmail address.
- **Attachments missing?** Make sure you’re using `FormData` and the backend is parsing files with `formidable`.

---

## 10. Security Note

- Never commit your `.env.local` file or app password to version control (git).

---

# ✅ You’re Done!

Your contact form is now fully configured to send emails (with attachments) via your Gmail account. 

---

## Associated Files

Below is a list of all files that are directly involved in the contact form feature. **Files marked with [MUST EDIT] are required to be changed for your Gmail setup.**

```
app/api/contact/route.ts   [MUST EDIT]
    - The API route that receives form submissions and sends emails (with attachments) via Gmail SMTP. You must set your Gmail address and ensure the logic matches your needs.

components/contact/ContactForm.tsx   [MUST EDIT]
    - The main contact form React component. Handles form UI, validation, and submission (including file uploads). You must ensure the form fields and submission logic match your requirements.

.env.local   [MUST EDIT]
    - Environment variables file. Stores your Gmail app password (`GMAIL_APP_PASSWORD`). You must add your app password here.

app/custom_contact_section/FluxeditaAdvancedFormSection.tsx
    - Section wrapper for the advanced contact form, used to add the form as a section on the home page or other pages.

app/custom_pages/components/PageControls.tsx
    - The Page Controls sidebar, where you can add the contact form section to a page.

app/custom_pages/types/sections.ts
    - Type definitions for page sections, including the contact form section type.

CONFIGURE_CONTACT_FORM_GMAIL.md
    - This setup and configuration guide.
```

**Tip:** If you add new features (e.g., admin dashboard for submissions, custom fields, etc.), you may need to update or add more files. Always restart your dev server after changing `.env.local` or installing new packages.

--- 