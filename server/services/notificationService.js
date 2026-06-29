const nodemailer = require('nodemailer');

// Create a reusable transporter using Ethereal (dev/test) or real SMTP
const createTransporter = async () => {
  // If real credentials are set in .env, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Otherwise use Ethereal test account (preview URLs in console)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendDockingStatusEmail = async ({ toEmail, toName, shipName, status, remarks, berthNumber }) => {
  try {
    const transporter = await createTransporter();
    const statusColor = status === 'Approved' ? '#10b981' : '#ef4444';
    const berthInfo = berthNumber ? `<p><strong>Assigned Berth:</strong> ${berthNumber}</p>` : '';
    const remarksInfo = remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : '';

    const mailOptions = {
      from: `"Harbour Management System" <${process.env.EMAIL_USER || 'noreply@harbour.com'}>`,
      to: toEmail,
      subject: `Docking Request ${status} — ${shipName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #0e7490); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #fff;">⚓ Harbour Management System</h1>
            <p style="margin: 8px 0 0; color: #bae6fd;">Port Operations Notification</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>${toName}</strong>,</p>
            <p>Your docking request for <strong>${shipName}</strong> has been updated:</p>
            <div style="background: #1e293b; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: ${statusColor};">Status: ${status}</p>
            </div>
            ${berthInfo}
            ${remarksInfo}
            <p style="color: #94a3b8; margin-top: 32px; font-size: 13px;">This is an automated notification from the Harbour Management System. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

module.exports = { sendDockingStatusEmail };
