import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, brandName: string) {
  try {
    const subject = `🍵 Welcome to Matcha Restock Alerts!`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Matcha Restock</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Frame: 650x579 -->
  <div style="width: 650px; height: 579px; background-color: #ffffff; margin: 0 auto;">
    
    <!-- Header: Logo Text Left (Row For Content Columns) -->
    <div style="width: 650px; height: 43px; background-color: #000000; display: flex; align-items: center; padding: 0;">
      <div style="margin-left: 16px; flex-grow: 1;">
        <div style="color: #ffffff; font-size: 16px; margin: 0;">🍵 Matcha Restock</div>
      </div>
    </div>
    
    <!-- Content: Paragraph (Row For Content Columns) -->
    <div style="width: 650px; height: 350px; background-color: #ffffff; display: flex; align-items: center; padding: 0;">
      <div style="margin-left: 50px; width: 550px; height: 286px;">
        
        <!-- Matcha Image: 42x53 -->
        <div style="width: 42px; height: 53px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-bottom: 22px;">
          🍵
        </div>
        
        <!-- Welcome Text -->
        <div style="width: 550px; height: 27px; color: #000000; font-size: 18px; font-weight: 600; margin-bottom: 22px;">
          Welcome! You're subscribed to ${brandName} alerts.
        </div>
        
        <!-- Description Text -->
        <div style="width: 550px; height: 162px; color: #000000; font-size: 14px; line-height: 1.6;">
          You're now signed up to receive notifications when ${brandName} matcha products come back in stock.<br><br>
          We'll monitor their inventory and send you an email as soon as any matcha becomes available. No more manual checking required!<br><br>
          Thank you for joining us. Have a great day!<br><br>
          - The Matcha Restock Team
        </div>
        
      </div>
    </div>
    
    <!-- Footer: Footer Stacked Center (Row For Content Columns) -->
    <div style="width: 650px; height: 186px; background-color: #ffffff; padding: 0;">
      <div style="margin: 10px 16px; width: 618px; height: 146px;">
        
        <!-- Divider -->
        <div style="width: 618px; height: 1px; background-color: #cccccc; margin-top: 10px; margin-bottom: 47px;"></div>
        
        <!-- Footer Text -->
        <div style="width: 618px; height: 16px; color: #aaaaaa; font-size: 12px; text-align: center; margin-bottom: 47px;">
          You're receiving this because you subscribed to matcha restock alerts
        </div>
        
        <!-- Navigation/Unsubscribe Link -->
        <div style="width: 72px; height: 15px; margin: 0 auto;">
          <a href="{{unsubscribe}}" style="color: #4d4d4d; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
        </div>
        
      </div>
    </div>
    
  </div>
</body>
</html>`;

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