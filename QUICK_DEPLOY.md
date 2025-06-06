# 🚀 Quick Deployment Checklist

## ⚡ 15-Minute Production Deployment

### Step 1: Database (5 minutes)
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Storage" → "Create Database" → "Postgres"**
3. **Name:** `matcha-stock-db`
4. **Copy the `DATABASE_URL`** (save it!)

### Step 2: Frontend Deploy (5 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# From your matcha-stock directory
cd matcha-stock
vercel

# Follow prompts, then add environment variables in Vercel dashboard:
# DATABASE_URL=your_copied_database_url
# RESEND_API_KEY=your_resend_key
```

### Step 3: Database Setup (3 minutes)
```bash
# In matcha-stock directory
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

### Step 4: AWS Lambda Setup (2 minutes)
```bash
# Make script executable
chmod +x lambda-scrapers/deploy_lambdas.sh

# Run deployment (you'll need AWS CLI configured)
./lambda-scrapers/deploy_lambdas.sh
```

## 🎯 What You Need Ready

### Accounts:
- ✅ Vercel account (free)
- ✅ AWS account (free tier)
- ✅ Resend account (free tier)

### Keys/URLs:
- ✅ `RESEND_API_KEY` from Resend dashboard
- ✅ `DATABASE_URL` from Vercel Postgres
- ✅ AWS CLI configured (`aws configure`)

## 🔧 Pre-Flight Checklist

**Before starting:**
1. [ ] Git repo is committed and clean
2. [ ] All environment variables are ready
3. [ ] AWS CLI is installed and configured
4. [ ] Vercel CLI is installed (`npm install -g vercel`)

## 📱 Testing Your Deployment

### Frontend:
1. Visit your Vercel URL
2. Check if pages load
3. Test database connections

### Scrapers:
1. Check AWS Lambda console
2. Trigger a test execution
3. Check CloudWatch logs

## 💰 Cost Breakdown (Free Tier)

- **Vercel Postgres**: Free (60 compute hours/month)
- **Vercel Hosting**: Free
- **AWS Lambda**: Free (1M requests/month)
- **Resend**: Free (3,000 emails/month)
- **Total**: $0/month initially

## 🆘 If Something Breaks

### Database Issues:
```bash
# Reset and migrate again
DATABASE_URL="your_url" npx prisma migrate reset
DATABASE_URL="your_url" npx prisma migrate deploy
```

### Frontend Issues:
- Check Vercel dashboard for build logs
- Verify environment variables are set
- Check function timeout settings

### Lambda Issues:
- Check CloudWatch logs in AWS console
- Verify IAM permissions
- Test with smaller timeout first

## 🚀 After Deployment

1. **Monitor**: Check dashboards daily first week
2. **Scale**: Upgrade plans as needed
3. **Secure**: Add proper error handling
4. **Optimize**: Monitor costs and performance

---

**Need help?** The full `DEPLOYMENT_GUIDE.md` has detailed troubleshooting! 