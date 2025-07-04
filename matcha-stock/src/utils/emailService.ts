import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, brandName: string) {
  try {
    const subject = `🍵 Welcome to Matcha Restock Alerts!`;
    
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Matcha Restock</title><style>@font-face { font-family: 'Roobert Mono'; src: url('https://updates.matcharestock.com/fonts/RoobertMonoTRIAL-Regular-BF67243fd29a433.otf') format('opentype'); font-weight: normal; font-style: normal; } body { font-family: 'Roobert Mono', 'Courier New', monospace; margin: 0; padding: 0; background-color: #f5f5f5; } .email-container { max-width: 650px; margin: 0 auto; background: #ffffff; } .header { background-color: #000000; height: 43px; display: flex; align-items: center; justify-content: center; padding: 0 16px; } .header-text { color: #ffffff; font-size: 16px; font-weight: 500; margin: 0; } .content { background-color: #ffffff; padding: 32px 50px 50px 50px; height: 330px; box-sizing: border-box; text-align: center; } .content-inner { display: flex; flex-direction: column; align-items: center; gap: 20px; } .matcha-image { width: 60px; height: 75px; margin-bottom: 10px; } .matcha-image img { width: 100%; height: 100%; object-fit: contain; } .welcome-text { color: #000000; font-size: 18px; font-weight: 600; margin: 0; line-height: 1.5; } .description-text { color: #000000; font-size: 14px; line-height: 1.6; margin: 0; } .footer { background-color: #ffffff; padding: 10px 16px; height: 186px; box-sizing: border-box; } .footer-inner { display: flex; flex-direction: column; gap: 47px; } .divider { height: 1px; background-color: #cccccc; margin-top: 10px; } .footer-text { color: #aaaaaa; font-size: 12px; text-align: center; margin: 0; } .footer-link { color: #4d4d4d; font-size: 12px; text-decoration: underline; text-align: center; margin: 0; } @media (max-width: 650px) { .email-container { width: 100%; margin: 0; } .content { padding: 20px 25px; height: auto; } .footer { padding: 10px 25px; height: auto; } } </style></head><body><div class="email-container"><div class="header"><h1 class="header-text">Matcha Restock</h1></div><div class="content"><div style="text-align: center;"><div class="matcha-image" style="margin-left: auto; margin-right: auto;"><img src="https://www.matcharestock.com/images/matchaemoji.png" alt="Matcha" /></div><p class="welcome-text">Welcome! You're subscribed to ${brandName} alerts.</p><p class="description-text">You're now signed up to receive notifications when ${brandName} matcha products come back in stock.<br><br>We'll monitor their inventory and send you an email as soon as any matcha becomes available.<br><br>Thank you and have a great day!</p></div></div><div class="footer"><div class="divider"></div><p class="footer-text" style="margin-top: 47px;">you're receiving this because you subscribed to matcha restock alerts.</p><p class="footer-link" style="margin-top: 15px;"><a href="{{unsubscribe}}" style="color: #4d4d4d; text-decoration: underline;">Unsubscribe</a></p></div></div></body></html>`;

    const textContent = `
🍵 Matcha Restock

Welcome! You're subscribed to ${brandName} alerts.

You're now signed up to receive notifications when ${brandName} matcha products come back in stock.

We'll monitor their inventory and send you an email as soon as any matcha becomes available. No more manual checking required!

Thank you for joining us. Have a great day!

- The Matcha Restock Team

---
You're receiving this because you subscribed to matcha restock alerts
Unsubscribe: {{unsubscribe}}
    `.trim();

    const { data, error } = await resend.emails.send({
      from: 'matcharestock <notifications@updates.matcharestock.com>',
      to: [email],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }

    console.log('Confirmation email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
} 