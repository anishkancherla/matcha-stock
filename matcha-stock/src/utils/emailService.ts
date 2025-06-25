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
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 650px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        
        /* Header Section - Black background with white text */
        .header-section {
          background-color: #000000;
          padding: 10px 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .header-text {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          line-height: 23px;
        }
        
        /* Main Content Section */
        .content-section {
          background-color: #ffffff;
          padding: 32px 50px;
        }
        .content-column {
          max-width: 550px;
        }
        .matcha-image {
          width: 42px;
          height: 53px;
          margin-bottom: 22px;
          display: block;
        }
        .main-heading {
          color: #000000;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 22px 0;
          line-height: 27px;
        }
        .main-text {
          color: #000000;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }
        
        /* Footer Section */
        .footer-section {
          background-color: #ffffff;
          padding: 10px 16px 30px 16px;
        }
        .footer-divider {
          width: 100%;
          height: 1px;
          background-color: #cccccc;
          margin: 10px 0 47px 0;
        }
        .footer-text {
          color: #aaaaaa;
          font-size: 12px;
          text-align: center;
          margin: 0 0 47px 0;
          line-height: 16px;
        }
        .footer-nav {
          text-align: center;
        }
        .footer-link {
          color: #4d4d4d;
          font-size: 12px;
          text-decoration: underline;
          line-height: 15px;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .content-section {
            padding: 20px 25px;
          }
          .content-column {
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header Section -->
        <div class="header-section">
          <h1 class="header-text">🍵 Matcha Restock</h1>
        </div>
        
        <!-- Main Content Section -->
        <div class="content-section">
          <div class="content-column">
            <!-- Matcha Image -->
            <div style="text-align: center; margin-bottom: 22px;">
              <span style="font-size: 42px;">🍵</span>
            </div>
            
            <!-- Main Heading -->
            <h2 class="main-heading">Welcome to ${brandName} Alerts!</h2>
            
            <!-- Main Text -->
            <div class="main-text">
              <p>Thank you for subscribing to restock notifications for <strong>${brandName}</strong> matcha products.</p>
              
              <p>We'll monitor their inventory and notify you immediately when any matcha comes back in stock. No more checking manually or missing out on your favorite products!</p>
              
              <p>You'll receive an email as soon as we detect new stock availability.</p>
              
              <p style="margin-top: 30px;">Happy matcha hunting! 🍵</p>
              
              <p style="margin-top: 20px; font-weight: 600;">- The Matcha Restock Team</p>
            </div>
          </div>
        </div>
        
        <!-- Footer Section -->
        <div class="footer-section">
          <div class="footer-divider"></div>
          
          <p class="footer-text">
            This confirmation was sent by Matcha Restock<br>
            Premium matcha stock monitoring service
          </p>
          
          <div class="footer-nav">
            <a href="#" class="footer-link">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
🍵 Matcha Restock - Welcome to ${brandName} Alerts!

Thank you for subscribing to restock notifications for ${brandName} matcha products.

We'll monitor their inventory and notify you immediately when any matcha comes back in stock. No more checking manually or missing out on your favorite products!

You'll receive an email as soon as we detect new stock availability.

Happy matcha hunting! 🍵

- The Matcha Restock Team

---
This confirmation was sent by Matcha Restock
Premium matcha stock monitoring service
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