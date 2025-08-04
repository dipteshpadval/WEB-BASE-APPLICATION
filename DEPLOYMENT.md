# 🚀 Deployment Guide

This guide will walk you through deploying the Excel File Manager to production.

## 📋 Prerequisites

Before starting, ensure you have:

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Supabase](https://supabase.com/) account
- [AWS](https://aws.amazon.com/) account
- [Vercel](https://vercel.com/) account
- [Render](https://render.com/) account

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Create Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'uploader', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('Holding', 'Offsite', 'Client Query', 'Value Price')),
  asset_type TEXT NOT NULL,
  client_code TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  s3_key TEXT NOT NULL,
  s3_location TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Users can view all files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Admins and uploaders can insert files" ON files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'uploader')
    )
  );

CREATE POLICY "Admins can delete files" ON files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3. Create Admin User
1. Go to Authentication > Users in Supabase
2. Create a new user with admin role
3. Or use the API to create an admin user

## ☁️ AWS S3 Setup

### 1. Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket with a unique name
3. Choose your preferred region
4. Keep default settings for now

### 2. Configure CORS
Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. Create IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

## 🚀 Backend Deployment (Render)

### 1. Connect Repository
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Choose the `backend` directory as the root

### 2. Configure Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.vercel.app

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Build Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Deploy
Click "Create Web Service" and wait for deployment.

## 🌐 Frontend Deployment (Vercel)

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set the root directory to `frontend`

### 2. Configure Environment Variables
Add this environment variable:

```
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

### 3. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Deploy
Click "Deploy" and wait for deployment.

## 🔧 Domain Configuration

### 1. Custom Domain (Optional)
1. In Vercel, go to your project settings
2. Add your custom domain
3. Update the `FRONTEND_URL` and `CORS_ORIGIN` in Render
4. Update the `VITE_API_URL` in Vercel

### 2. SSL Certificate
- Vercel provides automatic SSL
- Render provides automatic SSL
- No additional configuration needed

## 🔐 Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables properly set
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] File upload size limits set
- [ ] JWT secrets are secure
- [ ] Database RLS policies configured
- [ ] S3 bucket permissions correct

## 🧪 Testing Deployment

### 1. Test Authentication
1. Visit your frontend URL
2. Try to log in with admin credentials
3. Verify role-based access works

### 2. Test File Upload
1. Log in as admin or uploader
2. Upload an Excel file
3. Verify it appears in the file list

### 3. Test File Download
1. Click download on a file
2. Verify the signed URL works
3. Check file integrity

### 4. Test User Management
1. Log in as admin
2. Try to change user roles
3. Verify permissions work correctly

## 📊 Monitoring

### 1. Vercel Analytics
- Enable Vercel Analytics for frontend monitoring
- Monitor page views and performance

### 2. Render Logs
- Check Render logs for backend errors
- Monitor API response times

### 3. Supabase Dashboard
- Monitor database performance
- Check authentication logs

## 🔄 Updates and Maintenance

### 1. Code Updates
1. Push changes to GitHub
2. Vercel and Render will auto-deploy
3. Monitor deployment logs

### 2. Environment Variables
- Update in Vercel/Render dashboards
- Redeploy if needed

### 3. Database Migrations
- Run SQL commands in Supabase
- Test thoroughly before production

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGIN` in backend
   - Verify frontend URL is correct

2. **File Upload Fails**
   - Check AWS credentials
   - Verify S3 bucket permissions
   - Check file size limits

3. **Authentication Issues**
   - Verify Supabase configuration
   - Check JWT secret
   - Test token refresh

4. **Database Errors**
   - Check RLS policies
   - Verify table structure
   - Test database connection

### Support
- Check Render/Vercel logs
- Monitor Supabase dashboard
- Review application logs

## 📈 Scaling Considerations

1. **Database**: Supabase scales automatically
2. **File Storage**: S3 scales automatically
3. **Backend**: Render can scale vertically
4. **Frontend**: Vercel handles scaling

## 🔒 Security Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Secret Rotation**: Rotate JWT secrets periodically
3. **Access Logs**: Monitor user access patterns
4. **Backup Strategy**: Regular database backups
5. **Incident Response**: Plan for security incidents 