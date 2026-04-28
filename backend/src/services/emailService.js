import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

export const sendInviteEmail = async (toEmail, familyName, inviteToken) => {
  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${inviteToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #00C5FF;">🍽️ Family Meal Planner</h1>
      <p>Hallo,</p>
      <p>Du wurdest zur Familie <strong>${familyName}</strong> eingeladen!</p>

      <p>Mit Family Meal Planner kannst du:</p>
      <ul>
        <li>📅 Gemeinsamen Wochenplan erstellen</li>
        <li>🍳 Rezepte teilen</li>
        <li>🛒 Einkaufslisten koordinieren</li>
      </ul>

      <p style="margin-top: 30px;">
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #00C5FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Einladung akzeptieren
        </a>
      </p>

      <p style="color: #8B91A3; font-size: 12px; margin-top: 30px;">
        Link expires in 7 days. Oder kopiere diesen Link: ${inviteLink}
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: `Du wurdest zu "${familyName}" eingeladen! 🍽️`,
      html: htmlContent,
    });
    console.log('Email sent:', info.response);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    throw new Error('Could not send invitation email');
  }
};

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (err) {
    console.error('❌ Email service failed:', err);
    return false;
  }
};
