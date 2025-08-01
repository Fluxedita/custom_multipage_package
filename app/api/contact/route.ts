import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const OWNER_EMAIL = 'jamescroanin@gmail.com'; // Your Gmail address

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // or 587 for TLS
      secure: true, // true for port 465, false for 587
      auth: {
        user: OWNER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Contact Form" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, '<br/>')}</p>
      `,
      replyTo: data.email,
    };

    console.log('About to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent!');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
