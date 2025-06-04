import crypto from 'crypto';

/**
 * Generate a secure unsubscribe token for an email address
 * 
 * @param email - The user's email address
 * @returns A secure token in the format `timestamp.hash`
 */
export function generateUnsubscribeToken(email: string): string {
  const timestamp = Date.now().toString();
  const secretKey = process.env.UNSUBSCRIBE_SECRET || 'matcha-stock-default-secret';
  
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(`${email}:${timestamp}`)
    .digest('hex');
  
  return `${timestamp}.${hash}`;
}

/**
 * Generate an unsubscribe URL for the given email and optional brand/product ID
 * 
 * @param email - The user's email address
 * @param id - Optional brand or product ID to unsubscribe from specifically
 * @param type - Type of notification to unsubscribe from ('brand' or 'product')
 * @returns A complete unsubscribe URL
 */
export function generateUnsubscribeUrl(
  email: string,
  id?: string,
  type: 'brand' | 'product' = 'brand'
): string {
  const token = generateUnsubscribeToken(email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001';
  
  let url = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
  
  if (id) {
    url += `&brand=${id}&type=${type}`;
  }
  
  return url;
}

/**
 * Generate HTML for an unsubscribe link to include in emails
 * 
 * @param email - The user's email address
 * @param id - Optional brand or product ID to unsubscribe from specifically
 * @param type - Type of notification to unsubscribe from ('brand' or 'product')
 * @returns HTML string for the unsubscribe link
 */
export function generateUnsubscribeHtml(
  email: string,
  id?: string,
  type: 'brand' | 'product' = 'brand'
): string {
  const unsubscribeUrl = generateUnsubscribeUrl(email, id, type);
  
  return `
    <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
      <p style="color: #666; font-size: 12px;">
        Don't want to receive these notifications anymore?<br/>
        <a href="${unsubscribeUrl}" style="color: #2d5a27; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `;
}

/**
 * Generate text for an unsubscribe link to include in plain text emails
 * 
 * @param email - The user's email address
 * @param id - Optional brand or product ID to unsubscribe from specifically
 * @param type - Type of notification to unsubscribe from ('brand' or 'product')
 * @returns Plain text string for the unsubscribe link
 */
export function generateUnsubscribeText(
  email: string,
  id?: string,
  type: 'brand' | 'product' = 'brand'
): string {
  const unsubscribeUrl = generateUnsubscribeUrl(email, id, type);
  
  return `
---
Don't want to receive these notifications anymore?
Unsubscribe: ${unsubscribeUrl}
`;
} 