#!/usr/bin/env python3
import os
from dotenv import load_dotenv
import resend

# Load environment variables
load_dotenv()

# Resend configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "notifications@your-domain.com")

def test_resend_email():
    """Test Resend email functionality"""
    print("🧪 Testing Resend Email Functionality...")
    print("=" * 50)
    
    # Check if API key exists
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not found in environment variables!")
        print("💡 Get your API key from https://resend.com/api-keys")
        return False
    
    print(f"✅ API Key found: {RESEND_API_KEY[:8]}...")
    print(f"✅ From Email: {FROM_EMAIL}")
    
    # Initialize Resend
    resend.api_key = RESEND_API_KEY
    
    try:
        # Get test email
        to_email = input("Enter your email address for testing: ")
        
        # Create test email
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "🍵 Test Email from Matcha Stock",
            "html": """
            <h1>🍵 Hello from Matcha Stock!</h1>
            <p>This is a test email to verify your email notifications are working.</p>
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>✅ If you're reading this, your email notifications are set up correctly!</h3>
                <p>You'll receive beautiful notifications when your favorite matcha comes back in stock.</p>
            </div>
            <p>Happy matcha hunting! 🍵</p>
            """,
            "text": """
🍵 Hello from Matcha Stock!

This is a test email to verify your email notifications are working.

✅ If you're reading this, your email notifications are set up correctly!

You'll receive beautiful notifications when your favorite matcha comes back in stock.

Happy matcha hunting! 🍵
            """
        }
        
        print("\n📧 Sending test email...")
        email_result = resend.Emails.send(params)
        
        print(f"✅ Email sent successfully!")
        print(f"📧 Email ID: {email_result.get('id', 'Unknown')}")
        print(f"📬 Check your inbox: {to_email}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        if "Invalid API key" in str(e):
            print("💡 Check your RESEND_API_KEY in the .env file")
        elif "domain" in str(e).lower():
            print("💡 You may need to verify your sending domain in Resend")
        return False

if __name__ == "__main__":
    test_resend_email()
    
    print("\n" + "=" * 50)
    print("📝 Next steps:")
    print("1. Sign up at https://resend.com")
    print("2. Get your API key from https://resend.com/api-keys")
    print("3. Add RESEND_API_KEY to your .env file")
    print("4. (Optional) Set up a custom domain for better deliverability") 