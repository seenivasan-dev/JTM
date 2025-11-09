// Test SMTP Email Connection
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Email Service...\n');

// Check if SMTP settings are configured
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

console.log('SMTP Configuration:');
console.log('  Host:', smtpHost || 'NOT SET');
console.log('  Port:', smtpPort || 'NOT SET');
console.log('  User:', smtpUser ? `${smtpUser.substring(0, 5)}...` : 'NOT SET');
console.log('  Password:', smtpPassword ? '***SET***' : 'NOT SET');
console.log('');

if (!smtpHost || !smtpUser || !smtpPassword) {
  console.error('❌ SMTP settings are not configured properly in .env file\n');
  console.log('📝 Required settings:');
  console.log('   SMTP_HOST - your SMTP server (e.g., smtp.gmail.com)');
  console.log('   SMTP_PORT - usually 587 for TLS or 465 for SSL');
  console.log('   SMTP_USER - your email address');
  console.log('   SMTP_PASSWORD - your app password (NOT regular password)\n');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: parseInt(smtpPort || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

async function testSMTP() {
  try {
    console.log('1️⃣ Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('\n💡 Common issues:');
    console.error('   - Wrong SMTP host or port');
    console.error('   - Incorrect username or password');
    console.error('   - Need to use App Password (for Gmail/Google Workspace)');
    console.error('   - Firewall blocking SMTP port');
    console.error('   - Less secure app access disabled (for Gmail)\n');
    return;
  }

  try {
    console.log('2️⃣ Sending test email...');
    
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
    const fromName = process.env.SMTP_FROM_NAME || 'Test Sender';
    
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: "seenivasn@gmail.com", // Send to yourself for testing
      subject: 'Test Email from JTM Community',
      html: '<h1>Hello!</h1><p>This is a test email from your JTM application using SMTP.</p><p>If you received this, your SMTP configuration is working correctly! 🎉</p>',
      text: 'Hello! This is a test email from your JTM application using SMTP. If you received this, your SMTP configuration is working correctly!',
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 From:', `${fromName} <${fromEmail}>`);
    console.log('📧 To:', smtpUser);
    console.log('\n✨ Your SMTP integration is working correctly!');
    console.log('📥 Check your inbox at:', smtpUser);
    console.log('\n📝 Next steps:');
    console.log('   1. Check your email inbox (including spam folder)');
    console.log('   2. Start your dev server: npm run dev');
    console.log('   3. Test user activation to send real welcome emails\n');
  } catch (error) {
    console.error('\n❌ Failed to send test email:', error.message);
    console.error('Full error:', error);
  }
}

testSMTP();
