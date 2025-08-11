# AWS Deployment Guide for Splitwise

## Prerequisites
- AWS Account: 842069399230
- Region: us-east-2 (Ohio)
- Git repository with your code

## Step 1: Set Up Database (Amazon RDS)

### 1.1 Create PostgreSQL Database
1. Go to AWS RDS Console
2. Click "Create database"
3. Choose "Standard create"
4. Select "PostgreSQL" as engine
5. Choose "Free tier" for cost optimization
6. Configure:
   - **DB instance identifier**: `splitwise-db`
   - **Master username**: `splitwise_admin`
   - **Master password**: [Create a strong password]
   - **DB instance class**: `db.t3.micro` (free tier)
   - **Storage**: 20 GB
   - **Multi-AZ deployment**: No (free tier)
7. Click "Create database"

### 1.2 Get Database Connection String
After creation, note down:
- **Endpoint**: `splitwise-db.xxxxx.us-east-2.rds.amazonaws.com`
- **Port**: 5432
- **Database name**: `postgres`
- **Username**: `splitwise_admin`
- **Password**: [Your password]

## Step 2: Deploy to AWS Amplify

### 2.1 Connect Repository
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Choose "GitHub" or your Git provider
4. Connect your repository
5. Select the main branch

### 2.2 Configure Build Settings
Amplify will auto-detect Next.js. Use these settings:

**Build settings**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
        - pnpm run db:generate
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 2.3 Set Environment Variables
In Amplify Console → App settings → Environment variables:

```
DATABASE_URL=postgresql://splitwise_admin:YOUR_PASSWORD@splitwise-db.xxxxx.us-east-2.rds.amazonaws.com:5432/postgres
NODE_ENV=production
```

## Step 3: Database Migration

### 3.1 Update Schema for Production
Replace your current `prisma/schema.prisma` with the production version:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... rest of your models
```

### 3.2 Run Migration
1. In Amplify Console, go to "Build settings"
2. Add to preBuild commands:
```bash
pnpm prisma migrate deploy
```

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Amplify Console → Domain management
2. Click "Add domain"
3. Enter your domain (e.g., `splitwise.yourdomain.com`)
4. Follow DNS verification steps

### 4.2 SSL Certificate
Amplify automatically provisions SSL certificates via AWS Certificate Manager.

## Step 5: Environment Variables for Production

Set these in Amplify Console:

```
DATABASE_URL=postgresql://splitwise_admin:YOUR_PASSWORD@splitwise-db.xxxxx.us-east-2.rds.amazonaws.com:5432/postgres
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

## Step 6: Deploy

1. Push your code to your repository
2. Amplify will automatically build and deploy
3. Your app will be available at: `https://main.xxxxx.amplifyapp.com`

## Cost Estimation (Monthly)

- **AWS Amplify**: Free tier (1,000 build minutes, 15 GB storage)
- **RDS PostgreSQL**: Free tier (750 hours, 20 GB storage)
- **Data Transfer**: ~$0.09/GB after 1 GB free
- **Total**: ~$0-5/month for typical usage

## Monitoring & Maintenance

### 4.1 Set Up Monitoring
1. Enable CloudWatch for RDS
2. Set up Amplify notifications
3. Monitor costs in AWS Cost Explorer

### 4.2 Backup Strategy
- RDS automated backups (enabled by default)
- Consider manual snapshots for important data

## Troubleshooting

### Common Issues:
1. **Database Connection**: Check security groups allow Amplify IPs
2. **Build Failures**: Check build logs in Amplify Console
3. **Environment Variables**: Ensure DATABASE_URL is correctly formatted

### Security Groups for RDS:
- Allow inbound PostgreSQL (5432) from Amplify IP ranges
- Or use VPC peering for better security

## Next Steps

1. **Performance**: Enable RDS Performance Insights
2. **Scaling**: Upgrade RDS instance class as needed
3. **CDN**: Enable CloudFront for global distribution
4. **Monitoring**: Set up CloudWatch alarms

## Support

- AWS Amplify Documentation: https://docs.aws.amazon.com/amplify/
- RDS Documentation: https://docs.aws.amazon.com/rds/
- AWS Support: Available in your AWS Console
