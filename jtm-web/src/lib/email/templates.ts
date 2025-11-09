// JTM Web - Email Templates

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`

const buttonStyles = `
  background-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  display: inline-block;
  font-weight: 600;
  margin: 10px 0;
`

/**
 * Welcome Email Template (with temporary password)
 */
export function generateWelcomeEmail(params: {
  firstName: string
  email: string
  tempPassword: string
  loginUrl: string
}): { subject: string; html: string; text: string } {
  const { firstName, email, tempPassword, loginUrl } = params

  const subject = 'Welcome to JTM Community - Your Account is Ready!'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🙏 Welcome to JTM Community</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>Welcome to the JTM Community platform! Your account has been successfully created.</p>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">📧 Your Login Credentials</h3>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
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
      <a href="${loginUrl}" style="${buttonStyles}">
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

    <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our admin team at <a href="mailto:${process.env.ADMIN_EMAIL || 'jtm-notifications@jaxtamilmandram.org'}" style="color: #3b82f6;">${process.env.ADMIN_EMAIL || 'admin@jaxtamilmandram.org'}</a>.</p>

    <p style="margin-top: 20px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Welcome to JTM Community!

Hello ${firstName},

Welcome to the JTM Community platform! Your account has been successfully created.

Your Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
You will be required to change your password upon first login for security purposes.

Login here: ${loginUrl}

What You Can Do:
- View and RSVP to upcoming events
- Manage your profile and family members
- Renew your membership online
- Access your event QR codes
- Stay updated with community notifications

If you have any questions, please contact us at ${process.env.ADMIN_EMAIL || 'admin@jaxtamilmandram.org'}.

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * RSVP Confirmation Email Template
 */
export function generateRSVPConfirmationEmail(params: {
  firstName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  paymentReference: string
}): { subject: string; html: string; text: string } {
  const { firstName, eventTitle, eventDate, eventLocation, paymentReference } = params

  const subject = `RSVP Submitted - ${eventTitle}`

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ RSVP Submitted Successfully</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>Thank you for your RSVP! We have received your registration for the following event:</p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">📅 Event Details</h3>
      <p style="margin: 10px 0;"><strong>Event:</strong> ${eventTitle}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin: 10px 0;"><strong>Location:</strong> ${eventLocation}</p>
      <p style="margin: 10px 0;"><strong>Payment Reference:</strong> <code style="background-color: #dcfce7; padding: 4px 8px; border-radius: 4px;">${paymentReference}</code></p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">⏳ What's Next?</h4>
      <p style="margin-bottom: 0; color: #78350f;">An admin will review and approve your payment. Once approved, you'll receive an email with your event QR code. Please present this QR code at the event for check-in.</p>
    </div>
    
    <p>We look forward to seeing you at the event!</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
RSVP Submitted Successfully

Hello ${firstName},

Thank you for your RSVP! We have received your registration for:

Event: ${eventTitle}
Date: ${eventDate}
Location: ${eventLocation}
Payment Reference: ${paymentReference}

What's Next?
An admin will review and approve your payment. Once approved, you'll receive an email with your event QR code.

We look forward to seeing you at the event!

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * RSVP Approved Email Template (with QR Code)
 */
export function generateRSVPApprovedEmail(params: {
  firstName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  qrCodeUrl?: string
  qrCodeData: string
}): { subject: string; html: string; text: string } {
  const { firstName, eventTitle, eventDate, eventLocation, qrCodeData, qrCodeUrl } = params

  const subject = `✅ Payment Approved - ${eventTitle} QR Code`

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Approved!</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>Great news! Your payment has been approved for:</p>
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">📅 Event Details</h3>
      <p style="margin: 10px 0;"><strong>Event:</strong> ${eventTitle}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin: 10px 0;"><strong>Location:</strong> ${eventLocation}</p>
    </div>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">🎫 Your Event QR Code</h3>
      <p style="color: #059669; margin-bottom: 15px;">Please show this QR code at the event entrance</p>
      ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="Event QR Code" style="max-width: 250px; border: 2px solid #10b981; border-radius: 8px;" />` : ''}
      <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">QR Code: ${qrCodeData}</p>
      <p style="font-size: 14px; color: #065f46; margin-top: 10px;"><strong>Tip:</strong> Save this email or take a screenshot for easy access</p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">📱 Important Reminders</h4>
      <ul style="color: #78350f; margin-bottom: 0;">
        <li>Bring this QR code (digital or printed) to the event</li>
        <li>Arrive a few minutes early for smooth check-in</li>
        <li>Contact us if you need to make any changes</li>
      </ul>
    </div>
    
    <p>We're excited to see you at the event!</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Payment Approved!

Hello ${firstName},

Great news! Your payment has been approved.

Event: ${eventTitle}
Date: ${eventDate}
Location: ${eventLocation}

YOUR EVENT QR CODE: ${qrCodeData}

IMPORTANT REMINDERS:
- Bring this QR code (digital or printed) to the event
- Arrive a few minutes early for smooth check-in
- Contact us if you need to make any changes

We're excited to see you at the event!

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Event Reminder Email Template
 */
export function generateEventReminderEmail(params: {
  firstName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  daysUntilEvent: number
  hasQRCode: boolean
}): { subject: string; html: string; text: string } {
  const { firstName, eventTitle, eventDate, eventLocation, daysUntilEvent, hasQRCode } = params

  const subject = `📅 Reminder: ${eventTitle} in ${daysUntilEvent} day${daysUntilEvent !== 1 ? 's' : ''}`

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Event Reminder</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>This is a friendly reminder about your upcoming event:</p>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">📅 Event Details</h3>
      <p style="margin: 10px 0;"><strong>Event:</strong> ${eventTitle}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin: 10px 0;"><strong>Location:</strong> ${eventLocation}</p>
      <p style="margin: 10px 0; color: #b45309; font-size: 18px;"><strong>⏱️ In ${daysUntilEvent} day${daysUntilEvent !== 1 ? 's' : ''}!</strong></p>
    </div>
    
    ${hasQRCode ? `
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">🎫 Don't Forget Your QR Code!</h4>
      <p style="margin-bottom: 0; color: #1e40af;">Please bring your event QR code (from your approval email) for check-in. You can also access it from the mobile app.</p>
    </div>
    ` : `
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #991b1b; font-size: 16px;">⚠️ RSVP Reminder</h4>
      <p style="margin-bottom: 0; color: #991b1b;">It looks like you haven't RSVP'd yet. Please complete your RSVP to secure your spot!</p>
    </div>
    `}
    
    <p>We look forward to seeing you!</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Event Reminder

Hello ${firstName},

This is a friendly reminder about your upcoming event in ${daysUntilEvent} day${daysUntilEvent !== 1 ? 's' : ''}:

Event: ${eventTitle}
Date: ${eventDate}
Location: ${eventLocation}

${hasQRCode ? 'Don\'t forget to bring your event QR code for check-in!' : 'Please complete your RSVP to secure your spot.'}

We look forward to seeing you!

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Membership Renewal Request Confirmation Email
 */
export function generateRenewalRequestEmail(params: {
  firstName: string
  membershipType: string
  paymentReference: string
  submissionDate: string
}): { subject: string; html: string; text: string } {
  const { firstName, membershipType, paymentReference, submissionDate } = params

  const subject = 'Membership Renewal Request Received'

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Renewal Request Received</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>Thank you for submitting your membership renewal request!</p>
    
    <div style="background-color: #f5f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #5b21b6; font-size: 18px;">📋 Renewal Details</h3>
      <p style="margin: 10px 0;"><strong>Membership Type:</strong> ${membershipType}</p>
      <p style="margin: 10px 0;"><strong>Payment Reference:</strong> <code style="background-color: #ede9fe; padding: 4px 8px; border-radius: 4px;">${paymentReference}</code></p>
      <p style="margin: 10px 0;"><strong>Submitted:</strong> ${submissionDate}</p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">⏳ What's Next?</h4>
      <p style="margin-bottom: 0; color: #78350f;">
        An admin will review your renewal request and payment. You will receive an email notification once your renewal is processed. 
        This typically takes 1-2 business days.
      </p>
    </div>
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Membership Renewal Request Received

Hello ${firstName},

Thank you for submitting your membership renewal request!

Renewal Details:
Membership Type: ${membershipType}
Payment Reference: ${paymentReference}
Submitted: ${submissionDate}

What's Next?
An admin will review your renewal request and payment. You will receive an email notification once your renewal is processed (typically 1-2 business days).

If you have any questions, please contact us.

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Membership Renewal Approved Email
 */
export function generateRenewalApprovedEmail(params: {
  firstName: string
  membershipType: string
  expiryDate: string
  adminNotes?: string
}): { subject: string; html: string; text: string } {
  const { firstName, membershipType, expiryDate, adminNotes } = params

  const subject = '✅ Membership Renewal Approved!'

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Renewal Approved!</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>Great news! Your membership renewal has been <strong>approved</strong>.</p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">✨ Updated Membership Details</h3>
      <p style="margin: 10px 0;"><strong>Membership Type:</strong> ${membershipType}</p>
      <p style="margin: 10px 0;"><strong>Valid Until:</strong> ${expiryDate}</p>
      <p style="margin: 10px 0; color: #059669; font-size: 18px;"><strong>Status: ACTIVE ✅</strong></p>
    </div>
    
    ${adminNotes ? `
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">📝 Admin Note</h4>
      <p style="margin-bottom: 0; color: #1e40af;">${adminNotes}</p>
    </div>
    ` : ''}
    
    <p>You can now enjoy all the benefits of your ${membershipType} membership. Thank you for being a valued member of our community!</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Membership Renewal Approved!

Hello ${firstName},

Great news! Your membership renewal has been approved.

Updated Membership Details:
Membership Type: ${membershipType}
Valid Until: ${expiryDate}
Status: ACTIVE

${adminNotes ? `Admin Note: ${adminNotes}\n\n` : ''}You can now enjoy all the benefits of your ${membershipType} membership.

Thank you for being a valued member of our community!

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Membership Renewal Rejected Email
 */
export function generateRenewalRejectedEmail(params: {
  firstName: string
  membershipType: string
  rejectionReason?: string
  contactEmail: string
}): { subject: string; html: string; text: string } {
  const { firstName, membershipType, rejectionReason, contactEmail } = params

  const subject = 'Membership Renewal - Action Required'

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Action Required</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>We've reviewed your ${membershipType} membership renewal request, and unfortunately, we need additional information or corrections before we can proceed.</p>
    
    ${rejectionReason ? `
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #991b1b; font-size: 18px;">📝 Reason for Hold</h3>
      <p style="margin-bottom: 0; color: #991b1b;">${rejectionReason}</p>
    </div>
    ` : ''}
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">🔍 Next Steps</h4>
      <p style="margin-bottom: 0; color: #1e40af;">
        Please contact our admin team at <a href="mailto:${contactEmail}" style="color: #3b82f6; font-weight: 600;">${contactEmail}</a> 
        to resolve this issue. We're here to help and will work with you to complete your renewal.
      </p>
    </div>
    
    <p>We appreciate your patience and look forward to continuing your membership with us.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Membership Renewal - Action Required

Hello ${firstName},

We've reviewed your ${membershipType} membership renewal request, and we need additional information before we can proceed.

${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ''}Next Steps:
Please contact our admin team at ${contactEmail} to resolve this issue. We're here to help!

We appreciate your patience and look forward to continuing your membership.

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Membership Renewal Reminder Email (30 days before expiry)
 */
export function generateRenewalReminderEmail(params: {
  firstName: string
  membershipType: string
  expiryDate: string
  daysUntilExpiry: number
  renewalUrl: string
  familyMemberCount: number
}): { subject: string; html: string; text: string } {
  const { firstName, membershipType, expiryDate, daysUntilExpiry, renewalUrl, familyMemberCount } = params

  const subject = `⏰ Membership Renewal Reminder - Expires in ${daysUntilExpiry} days`

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Renewal Reminder</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
    
    <p>This is a friendly reminder that your JTM membership is expiring soon.</p>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">📅 Membership Status</h3>
      <p style="margin: 10px 0;"><strong>Membership Type:</strong> ${membershipType}</p>
      <p style="margin: 10px 0;"><strong>Expiry Date:</strong> ${expiryDate}</p>
      <p style="margin: 10px 0; color: #b45309; font-size: 18px;"><strong>⏰ ${daysUntilExpiry} days remaining</strong></p>
      ${familyMemberCount > 0 ? `<p style="margin: 10px 0;"><strong>Family Members:</strong> ${familyMemberCount}</p>` : ''}
    </div>
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
      <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">✨ Renew Your Membership</h4>
      <p style="color: #1e40af;">Don't miss out on:</p>
      <ul style="color: #1e40af;">
        <li>Access to exclusive community events</li>
        <li>Member-only benefits and discounts</li>
        <li>Spiritual programs and activities</li>
        <li>Community networking opportunities</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${renewalUrl}" style="${buttonStyles}">
        🔄 Renew Membership Now
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      <strong>Note:</strong> If you've already submitted your renewal, please disregard this reminder.
    </p>
    
    <p style="margin-top: 30px;">Thank you for being a valued member of our community!</p>
    
    <p style="margin-top: 20px;">Best regards,<br><strong>JTM Community Team</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community. All rights reserved.</p>
  </div>
</body>
</html>
  `

  const text = `
Membership Renewal Reminder

Hello ${firstName},

This is a friendly reminder that your JTM membership is expiring soon.

Membership Status:
Membership Type: ${membershipType}
Expiry Date: ${expiryDate}
Time Remaining: ${daysUntilExpiry} days
${familyMemberCount > 0 ? `Family Members: ${familyMemberCount}\n` : ''}
Renew Your Membership:
Don't miss out on access to exclusive community events, member-only benefits, spiritual programs, and networking opportunities.

Renew now: ${renewalUrl}

Note: If you've already submitted your renewal, please disregard this reminder.

Thank you for being a valued member of our community!

Best regards,
JTM Community Team
  `.trim()

  return { subject, html, text }
}

/**
 * Admin Notification - New Renewal Request
 */
export function generateAdminRenewalNotificationEmail(params: {
  memberName: string
  memberEmail: string
  membershipType: string
  paymentReference: string
  renewalId: string
  adminUrl: string
}): { subject: string; html: string; text: string } {
  const { memberName, memberEmail, membershipType, paymentReference, renewalId, adminUrl } = params

  const subject = `🔔 New Membership Renewal Request - ${memberName}`

  const html = `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Renewal Request</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello Admin,</p>
    
    <p>A new membership renewal request has been submitted and requires your review.</p>
    
    <div style="background-color: #eef2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #3730a3; font-size: 18px;">👤 Member Information</h3>
      <p style="margin: 10px 0;"><strong>Name:</strong> ${memberName}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${memberEmail}</p>
      <p style="margin: 10px 0;"><strong>Membership Type:</strong> ${membershipType}</p>
      <p style="margin: 10px 0;"><strong>Payment Reference:</strong> <code style="background-color: #ddd6fe; padding: 4px 8px; border-radius: 4px;">${paymentReference}</code></p>
      <p style="margin: 10px 0;"><strong>Request ID:</strong> ${renewalId}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${adminUrl}" style="${buttonStyles}">
        🔍 Review Request
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">Please review and process this request at your earliest convenience.</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>© ${new Date().getFullYear()} JTM Community - Admin Notification</p>
  </div>
</body>
</html>
  `

  const text = `
New Membership Renewal Request

Hello Admin,

A new membership renewal request requires your review.

Member Information:
Name: ${memberName}
Email: ${memberEmail}
Membership Type: ${membershipType}
Payment Reference: ${paymentReference}
Request ID: ${renewalId}

Review request: ${adminUrl}

Please process this request at your earliest convenience.
  `.trim()

  return { subject, html, text }
}
