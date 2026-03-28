import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@trustinbox.com',
  subject: {
    otp: 'Your TrustinBox OTP Code',
  },
};