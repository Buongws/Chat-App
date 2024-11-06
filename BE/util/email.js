// util/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email utility
export const sendEmail = async ({ to, subject, text }) => {
  console.log('111', process.env.EMAIL_USER, process.env.EMAIL_PASS);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject, // Subject line
    text, // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Error sending email');
  }
};

export default sendEmail;
