import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../utils/prisma';
import crypto from 'crypto';

// Function to verify the unsubscribe token
function verifyUnsubscribeToken(token: string, email: string): boolean {
  try {
    const [timestamp, hash] = token.split('.');
    const timestampNumber = parseInt(timestamp, 10);
    
    // Check if the token is expired (valid for 1 year)
    if (Date.now() - timestampNumber > 365 * 24 * 60 * 60 * 1000) {
      return false;
    }
    
    // Verify the hash
    const secretKey = process.env.UNSUBSCRIBE_SECRET || 'matcha-stock-default-secret';
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(`${email}:${timestamp}`)
      .digest('hex');
    
    return hash === expectedHash;
  } catch (error) {
    console.error('Error verifying unsubscribe token:', error);
    return false;
  }
}

// GET handler for the unsubscribe page
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const brandId = searchParams.get('brand');
  const type = searchParams.get('type') || 'brand'; // 'brand' or 'product'
  
  // Validate required parameters
  if (!email || !token) {
    return new Response('Missing required parameters', { status: 400 });
  }
  
  // Verify the token
  if (!verifyUnsubscribeToken(token, email)) {
    return new Response('Invalid or expired unsubscribe token', { status: 403 });
  }
  
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return new Response('User not found', { status: 404 });
    }
    
    // Handle brand notification unsubscribe
    if (type === 'brand' && brandId) {
      await prisma.brandNotification.updateMany({
        where: {
          userId: user.id,
          brandId: brandId,
        },
        data: {
          active: false,
        },
      });
      
      // Return a success page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - Matcha Stock</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              padding: 30px;
              margin-top: 40px;
              text-align: center;
            }
            .header {
              background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .button {
              background: #2d5a27;
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🍵 Unsubscribed</h1>
            </div>
            <h2>You've been unsubscribed!</h2>
            <p>You will no longer receive notifications for this brand.</p>
            <p>If you change your mind, you can always resubscribe on our website.</p>
            <a href="/" class="button">Return to Matcha Stock</a>
          </div>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } 
    // Handle specific product unsubscribe
    else if (type === 'product' && brandId) {
      // Note: We're using brandId as productId for product notifications
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          productId: brandId, // Actually the productId in this case
        },
        data: {
          active: false,
        },
      });
      
      // Return a success page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - Matcha Stock</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              padding: 30px;
              margin-top: 40px;
              text-align: center;
            }
            .header {
              background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .button {
              background: #2d5a27;
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🍵 Unsubscribed</h1>
            </div>
            <h2>You've been unsubscribed!</h2>
            <p>You will no longer receive notifications for this product.</p>
            <p>If you change your mind, you can always resubscribe on our website.</p>
            <a href="/" class="button">Return to Matcha Stock</a>
          </div>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    // Unsubscribe from all notifications
    else {
      // Deactivate all brand notifications
      await prisma.brandNotification.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          active: false,
        },
      });
      
      // Deactivate all product notifications
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          active: false,
        },
      });
      
      // Return a success page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - Matcha Stock</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              padding: 30px;
              margin-top: 40px;
              text-align: center;
            }
            .header {
              background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .button {
              background: #2d5a27;
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🍵 Unsubscribed</h1>
            </div>
            <h2>You've been unsubscribed from all notifications!</h2>
            <p>You will no longer receive any notifications from Matcha Stock.</p>
            <p>If you change your mind, you can always resubscribe on our website.</p>
            <a href="/" class="button">Return to Matcha Stock</a>
          </div>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Error processing unsubscribe request:', error);
    return new Response('Error processing unsubscribe request', { status: 500 });
  }
} 