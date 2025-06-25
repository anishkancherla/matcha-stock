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
      <style>
        body {
          font-family: 'roobert-mono', 'Courier New', monospace;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
        }
        .brand-highlight {
          background: #e8f5e8;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #2d5a27;
        }
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        h2 {
          color: #2d5a27;
          margin-bottom: 15px;
        }
        p {
          margin: 15px 0;
        }
        .emoji {
          font-size: 1.2em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="emoji">🍵</span> Welcome to Matcha Restock!</h1>
        </div>
        
        <div class="content">
          <h2>Hello!</h2>
          
          <p>You're now subscribed to <strong>MatchaRestock alerts for ${brandName}</strong>.</p>
          
          <div class="brand-highlight">
            <p><strong><span class="emoji">🔔</span> What happens next?</strong></p>
            <p>We'll monitor ${brandName} for you and send you an email as soon as any of their matcha products come back in stock. No more manual checking required!</p>
          </div>
          
          <p>Thank you! Have a great day! </p>
          
          <p style="margin-top: 30px; font-weight: 500;">- Anish</p>
        </div>
        
        <div class="footer">
          <p>This confirmation was sent by <strong>Matcha Stock</strong><br>
          Premium matcha restock notifications</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
🍵 Welcome to Matcha Restock!

Hello!

You're now subscribed to MatchaRestock alerts for ${brandName}.

🔔 What happens next?
We'll monitor ${brandName} for you and send you an email as soon as any of their matcha products come back in stock. No more manual checking required!

Thank you! Have a great day 🍵

- Anish

---
This confirmation was sent by Matcha Stock
Premium matcha restock notifications
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