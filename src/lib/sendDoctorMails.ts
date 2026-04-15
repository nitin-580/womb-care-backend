import { resend } from './resend';

export async function sendDoctorApplicationMail(email: string, name: string, registrationNum: string) {
  return resend.emails.send({
    from: 'WombCare <onboarding@remedy.wombcare.live>',
    to: email,
    subject: 'WombCare Provider Application Received',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h1 style="color: #db2777;">Thank you, Dr. ${name}!</h1>
        <p>We've received your application to join WombCare as a provider.</p>
        <p>Our medical board will review your credentials (Registration: ${registrationNum}) and get back to you within 2-3 business days.</p>
        <p>Stay balanced,<br/>Team WombCare</p>
      </div>
    `,
  });
}

export async function sendDoctorApprovalMail(email: string, name: string) {
  return resend.emails.send({
    from: 'WombCare <onboarding@remedy.wombcare.live>',
    to: email,
    subject: 'Action Required: Your WombCare Doctor Account is Approved!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h1 style="color: #db2777;">Congratulations Dr. ${name}!</h1>
        <p>Your application to join the WombCare network has been approved.</p>
        <p>You can now sign in to your provider dashboard using your registered email: <strong>${email}</strong></p>
        <a href="https://wombcare.live/login" style="display: inline-block; padding: 12px 24px; background: #db2777; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
      </div>
    `,
  });
}
