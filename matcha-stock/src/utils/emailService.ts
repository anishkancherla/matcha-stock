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
        @font-face {
          font-family: 'Roobert Mono';
          src: url('https://updates.matcharestock.com/fonts/RoobertMonoTRIAL-Regular-BF67243fd29a433.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        
        body {
          font-family: 'Roobert Mono', 'Courier New', monospace;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 650px;
          margin: 0 auto;
          background: #ffffff;
        }
        
        /* Header - Black background matching Figma */
        .header {
          background-color: #000000;
          height: 43px;
          display: flex;
          align-items: center;
          padding: 0 16px;
        }
        .header-text {
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }
        
        /* Content section - White background */
        .content {
          background-color: #ffffff;
          padding: 32px 50px;
          height: 350px;
          box-sizing: border-box;
        }
        .content-inner {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .matcha-image {
          width: 42px;
          height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .matcha-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .welcome-text {
          color: #000000;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          line-height: 1.5;
        }
        .description-text {
          color: #000000;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        
        /* Footer - White background with divider */
        .footer {
          background-color: #ffffff;
          padding: 10px 16px;
          height: 186px;
          box-sizing: border-box;
        }
        .footer-inner {
          display: flex;
          flex-direction: column;
          gap: 47px;
        }
        .divider {
          height: 1px;
          background-color: #cccccc;
          margin-top: 10px;
        }
        .footer-text {
          color: #aaaaaa;
          font-size: 12px;
          text-align: center;
          margin: 0;
        }
        .footer-link {
          color: #4d4d4d;
          font-size: 12px;
          text-decoration: underline;
          text-align: center;
          margin: 0;
        }
        
        /* Mobile responsive */
        @media (max-width: 650px) {
          .email-container {
            width: 100%;
            margin: 0;
          }
          .content {
            padding: 20px 25px;
            height: auto;
          }
          .footer {
            padding: 10px 25px;
            height: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header - Logo Text Left -->
        <div class="header">
          <h1 class="header-text">🍵 Matcha Restock</h1>
        </div>
        
        <!-- Content - Paragraph section -->
        <div class="content">
          <div class="content-inner">
            <!-- Matcha image -->
            <div class="matcha-image">
              <img src="https://updates.matcharestock.com/images/matchaemoji.png" alt="Matcha" />
            </div>
            
            <!-- Welcome text -->
            <p class="welcome-text">Welcome! You're subscribed to ${brandName} alerts.</p>
            
            <!-- Description text -->
            <p class="description-text">
              You're now signed up to receive notifications when ${brandName} matcha products come back in stock. 
              <br><br>
              We'll monitor their inventory and send you an email as soon as any matcha becomes available. 
              <br><br>
              Thank you and have a great day!
              <br><br>
              - Matcha Restock
            </p>
          </div>
        </div>
        
        <!-- Footer - Footer Stacked Center -->
        <div class="footer">
          <div class="footer-inner">
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Footer text -->
            <p class="footer-text">
              you're receiving this because you subscribed to matcha restock alerts
            </p>
            
            <!-- Unsubscribe link -->
            <p class="footer-link">
              <a href="{{unsubscribe}}" style="color: #4d4d4d; text-decoration: underline;">
                Unsubscribe
              </a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

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