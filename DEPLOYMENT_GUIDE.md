# 🚀 Matcha Stock App - Production Deployment Guide

## Architecture Overview

```
Frontend (Vercel) → Database (Vercel Postgres) ← Scrapers (AWS Lambda)
                          ↓
                   Notifications (Resend)
```

## Step 1: Database Setup (Vercel Postgres)

### 1.1 Create Vercel Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it `matcha-stock-db`
4. Select a region close to your users
5. Choose the Hobby plan (free) for testing

### 1.2 Get Database URL
- Copy the `DATABASE_URL` from Vercel dashboard
- It will look like: `postgres://user:pass@region.vercel-storage.com/dbname`

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Environment Variables
Create these environment variables in Vercel:

```bash
# Database
DATABASE_URL=your_vercel_postgres_url

# Resend for notifications
RESEND_API_KEY=your_resend_api_key

# Optional: Redis for queue (if using Bull queue)
REDIS_URL=your_redis_url
```

### 2.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# From your matcha-stock directory
cd matcha-stock
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set build settings:
#   - Framework: Next.js
#   - Build Command: npm run build
#   - Install Command: npm install
#   - Output Directory: .next
```

### 2.3 Configure Build Settings
In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all environment variables
3. Go to Functions → set max duration to 60s (for GraphQL queries)

## Step 3: Database Migration

### 3.1 Run Prisma Migrations
```bash
# Install dependencies locally
npm install

# Generate Prisma client
npx prisma generate

# Run migrations against production DB
DATABASE_URL="your_production_url" npx prisma migrate deploy

# Optional: Seed initial data
DATABASE_URL="your_production_url" npx prisma db seed
```

## Step 4: Scrapers Setup (AWS Lambda)

### 4.1 Prepare Scraper Package
Create a deployment package for each scraper:

```bash
# Create scrapers deployment folder
mkdir lambda-scrapers
cd lambda-scrapers

# Copy your Python scrapers
cp ../matcha-stock/scrapers/*.py .
cp ../matcha-stock/scrapers/requirements.txt .

# Create lambda_function.py for each scraper
```

### 4.2 AWS Setup
1. **Create IAM Role:**
   - Service: Lambda
   - Permissions: `AWSLambdaBasicExecutionRole`
   - Add CloudWatch Events permissions

2. **Create Lambda Functions:**
   - Runtime: Python 3.11
   - Architecture: x86_64
   - Memory: 512MB
   - Timeout: 5 minutes

3. **Set Environment Variables:**
   ```
   DATABASE_URL=your_vercel_postgres_url
   RESEND_API_KEY=your_resend_api_key
   ```

### 4.3 CloudWatch Schedule
Create EventBridge rules:
- Rule name: `matcha-scraper-schedule`
- Schedule: `rate(5 minutes)`
- Target: Your Lambda function

## Step 5: Domain & SSL (Optional)

### 5.1 Custom Domain
1. Add domain in Vercel dashboard
2. Configure DNS to point to Vercel
3. SSL is automatic with Vercel

## Step 6: Monitoring & Logging

### 6.1 Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and errors

### 6.2 AWS CloudWatch
- Monitor Lambda execution
- Set up alerts for failures

### 6.3 Database Monitoring
- Use Vercel Postgres dashboard
- Monitor connection counts and query performance

## Step 7: Environment-Specific Configuration

### 7.1 Production Environment Variables
```bash
# Required for production
NODE_ENV=production
DATABASE_URL=your_production_db_url
RESEND_API_KEY=your_resend_key

# Optional
REDIS_URL=your_redis_url (for Bull queue)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 8: Testing Production Deployment

### 8.1 Frontend Testing
1. Visit your Vercel URL
2. Test GraphQL endpoints
3. Verify database connections

### 8.2 Scraper Testing
1. Manually trigger Lambda functions
2. Check CloudWatch logs
3. Verify database updates

### 8.3 Notification Testing
1. Test Resend email delivery
2. Verify notification triggers

## Cost Estimation

### Monthly Costs (starting small):
- **Vercel Postgres Hobby**: Free (60 compute hours)
- **Vercel Hosting**: Free (hobby plan)
- **AWS Lambda**: ~$5-10/month (depending on usage)
- **Resend**: Free tier (3,000 emails/month)
- **Total**: ~$5-10/month

### Scaling costs:
- **Vercel Pro**: $20/month (team features)
- **Vercel Postgres Pro**: $20/month (always-on)
- **AWS Lambda**: Pay per execution
- **Resend Pro**: $20/month (50,000 emails)

## Troubleshooting

### Common Issues:
1. **Database connection timeouts**: Use connection pooling
2. **Lambda cold starts**: Consider provisioned concurrency
3. **CORS issues**: Configure in next.config.ts
4. **Memory issues**: Increase Lambda memory allocation

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Database**: Use connection pooling and SSL
3. **Lambda**: Use least privilege IAM roles
4. **Vercel**: Enable preview deployments for testing

## Next Steps After Deployment

1. **Monitoring**: Set up error tracking (Sentry)
2. **Analytics**: Add user analytics
3. **Performance**: Optimize scraper frequency
4. **Features**: Add user authentication
5. **Scaling**: Consider edge functions for global performance 