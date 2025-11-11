#!/usr/bin/env tsx
/**
 * Manual Send Activation Email Script
 * 
 * This script allows admins to manually send activation emails to users
 * who didn't receive their initial welcome email.
 * 
 * Usage:
 *   npx tsx scripts/send-activation-email.ts <user-email>
 * 
 * Example:
 *   npx tsx scripts/send-activation-email.ts john.doe@example.com
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function sendActivationEmail(userEmail: string) {
  try {
    console.log(`🔍 Looking for user: ${userEmail}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Has temp password: ${user.tempPassword ? 'Yes' : 'No'}`);

    // Check if user is active
    if (!user.isActive) {
      console.error(`❌ User is not active. Please activate the user first.`);
      console.log(`   Run: UPDATE "User" SET "isActive" = true WHERE email = '${userEmail}';`);
      process.exit(1);
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

    console.log(`🔑 Generated new temporary password: ${tempPassword}`);

    // Update user with new temp password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tempPassword: hashedTempPassword,
        mustChangePassword: true,
      },
    });

    console.log(`✅ Updated user in database with new temp password`);

    // Create email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify SMTP connection
    console.log(`📧 Verifying SMTP connection...`);
    await transporter.verify();
    console.log(`✅ SMTP connection verified`);

    // Generate email content
    // Ensure loginUrl has protocol
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const loginUrl = baseUrl.startsWith('http') ? `${baseUrl}/auth/login` : `https://${baseUrl}/auth/login`;
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@jaxtamilmandram.org';
    const fromName = process.env.SMTP_FROM_NAME || 'JTM Community';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🙏 Welcome to JTM Community</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${user.firstName}</strong>,</p>
    
    <p>Welcome to the JTM Community platform! Your account has been successfully activated.</p>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">📧 Your Login Credentials</h3>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
      <p style="margin: 10px 0;">
        <strong>Temporary Password:</strong> 
        <code style="background-color: #dbeafe; padding: 6px 12px; border-radius: 4px; font-size: 14px; color: #1e40af; font-weight: 600;">${tempPassword}</code>
      </p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">🔒 Important Security Notice</h4>
      <p style="margin-bottom: 0; color: #78350f;">You will be required to change your password upon first login for security purposes. Please keep your credentials safe and do not share them with anyone.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}/auth/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin: 10px 0;">
        🚀 Login to Your Account
      </a>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <h4 style="color: #1f2937; font-size: 16px;">What You Can Do:</h4>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>View and RSVP to upcoming events</li>
        <li>Manage your profile and family members</li>
        <li>Renew your membership online</li>
        <li>Access your event QR codes</li>
        <li>Stay updated with community notifications</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our admin team.</p>

    <p style="margin-top: 20px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const emailText = `
Welcome to JTM Community!

Hello ${user.firstName},

Welcome to the JTM Community platform! Your account has been successfully activated.

Your Login Credentials:
Email: ${user.email}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
You will be required to change your password upon first login for security purposes.

Login here: ${loginUrl}/auth/login

What You Can Do:
- View and RSVP to upcoming events
- Manage your profile and family members
- Renew your membership online
- Access your event QR codes
- Stay updated with community notifications

If you have any questions, please contact our admin team.

Best regards,
JTM Community Team
    `.trim();

    // Send email
    console.log(`📧 Sending activation email to ${user.email}...`);
    
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: user.email,
      subject: 'Welcome to JTM Community - Your Account is Ready!',
      html: emailHtml,
      text: emailText,
    });

    console.log(`✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`\n📝 Summary:`);
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Temp Password: ${tempPassword}`);
    console.log(`   Login URL: ${loginUrl}/auth/login`);
    console.log(`\n⚠️  The user must change this password on first login.`);

  } catch (error) {
    console.error(`❌ Error sending activation email:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
const userEmail = process.argv[2];

if (!userEmail) {
  console.error(`❌ Usage: npx tsx scripts/send-activation-email.ts <user-email>`);
  console.error(`   Example: npx tsx scripts/send-activation-email.ts john.doe@example.com`);
  process.exit(1);
}

sendActivationEmail(userEmail);
