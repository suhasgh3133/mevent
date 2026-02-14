# Render Deployment Guide

This guide explains how to deploy the Photoflow application on Render with separate backend and frontend services using GitHub Actions.

## Architecture Overview

```
GitHub Repository
    ↓
GitHub Actions CI/CD
    ├── Backend CI Pipeline
    │   └── Deploy to Render (Backend Service)
    └── Frontend CI Pipeline
        └── Deploy to Render (Frontend Service)
```

## Prerequisites

1. **GitHub Account** - Repository must be on GitHub
2. **Render Account** - Create free account at https://render.com
3. **MongoDB Atlas** - Create a free cluster at https://www.mongodb.com/cloud/atlas
4. **Credentials for services** - API keys for Firebase, SendGrid, Cloudinary, Razorpay, etc.

## Step 1: Create Services on Render

### Backend Service Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name**: `photoflow-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Build Command**: `cd backend && npm ci`
   - **Start Command**: `cd backend && npm run prod`
   - **Plan**: Select your preferred plan (Free/Paid)

5. Click **Create Web Service** (don't deploy yet)
6. Copy the **Service ID** from the URL or settings

### Frontend Service Setup

1. Click **New +** → **Web Service** again
2. Configure:
   - **Name**: `photoflow-frontend`
   - **Environment**: `Node`
   - **Region**: Choose same as backend
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Start Command**: `cd frontend && npm run start`
   - **Plan**: Select your preferred plan

3. Click **Create Web Service**
4. Copy the **Service ID**

## Step 2: Get Render API Key

1. Go to **Account Settings** → **API Keys**
2. Click **Create API Key**
3. Copy the API key (keep it secret!)

## Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Repository Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

```
RENDER_API_KEY = <your_render_api_key>
RENDER_SERVICE_ID_BACKEND = <backend_service_id>
RENDER_SERVICE_ID_FRONTEND = <frontend_service_id>
REACT_APP_API_URL = https://photoflow-backend.onrender.com
```

## Step 4: Configure Environment Variables on Render

### Backend Service Environment Variables

On Render dashboard for backend service, go to **Environment**:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = <your_mongodb_atlas_connection_string>
JWT_SECRET = <your_jwt_secret_key>
FRONTEND_URL = https://photoflow-frontend.onrender.com
SENDGRID_API_KEY = <your_sendgrid_api_key>
CLOUDINARY_CLOUD_NAME = <your_cloudinary_name>
CLOUDINARY_API_KEY = <your_cloudinary_key>
CLOUDINARY_API_SECRET = <your_cloudinary_secret>
RAZORPAY_KEY_ID = <your_razorpay_key_id>
RAZORPAY_KEY_SECRET = <your_razorpay_key_secret>
```

### Frontend Service Environment Variables

On Render dashboard for frontend service, go to **Environment**:

```
NODE_ENV = production
PORT = 3000
REACT_APP_API_URL = https://photoflow-backend.onrender.com
REACT_APP_FIREBASE_API_KEY = <your_firebase_api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN = <your_firebase_auth_domain>
REACT_APP_FIREBASE_PROJECT_ID = <your_firebase_project_id>
REACT_APP_FIREBASE_STORAGE_BUCKET = <your_firebase_storage_bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = <your_firebase_messaging_sender_id>
REACT_APP_FIREBASE_APP_ID = <your_firebase_app_id>
```

## Step 5: Update CORS Settings

Backend has CORS configured for production. Make sure `FRONTEND_URL` environment variable matches your Render frontend URL.

In [backend/index.js](backend/index.js), update the production origins if needed:

```javascript
origin: process.env.NODE_ENV === "production"
  ? [
      process.env.FRONTEND_URL || "https://photoflow-frontend.onrender.com",
      "https://your-custom-domain.com"
    ]
  : [...]
```

## Step 6: Deploy

### Initial Deployment

1. On Render, click **Deploy** on each service manually first time
2. Check logs to ensure services start correctly

### Automatic Deployments

Once GitHub Actions secrets are configured:

1. Push code to `main` branch
2. GitHub Actions workflows trigger automatically
3. Backend deploys when `backend/**` files change
4. Frontend deploys when `frontend/**` files change

## GitHub Actions Workflows

### CI/CD Workflows Included

1. **backend-ci.yml** - Runs tests on backend changes
2. **frontend-ci.yml** - Builds and tests frontend
3. **deploy-backend.yml** - Deploys backend to Render
4. **deploy-frontend.yml** - Deploys frontend to Render

## Monitoring & Logs

### View Logs on Render

1. Go to service page
2. Click **Logs** tab
3. Monitor deployment and application logs

### GitHub Actions Logs

1. Go to **Actions** tab in GitHub
2. Select workflow run
3. View detailed logs

## Health Checks

Both services include health checks:

- **Backend**: `GET http://localhost:5000/health`
- **Frontend**: `GET http://localhost:3000`

Add a `/health` endpoint to your backend if it doesn't exist:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

## Troubleshooting

### Service Won't Deploy

1. Check environment variables are set correctly
2. Verify build commands in Render settings
3. Check logs for errors
4. Ensure Node version is compatible (18+)

### CORS Errors

1. Verify `FRONTEND_URL` is set correctly
2. Check frontend `REACT_APP_API_URL` matches backend URL
3. Ensure backend CORS configuration includes frontend URL

### Database Connection Issues

1. Verify MongoDB Atlas connection string
2. Whitelist Render IPs in MongoDB Atlas
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Enter `0.0.0.0/0` (or be more restrictive)

### Build Failures

1. Check `package.json` scripts are correct
2. Verify all dependencies are listed
3. Check build command path is correct (`cd backend` or `cd frontend`)

## Production Checklist

- [ ] All environment variables set on Render
- [ ] MongoDB Atlas configured and IP whitelisted
- [ ] GitHub secrets configured
- [ ] Webhooks/APIs set up if needed
- [ ] Email service configured
- [ ] Payment gateway credentials verified
- [ ] Firebase configuration correct
- [ ] Custom domains configured (optional)
- [ ] SSL certificates auto-provisioned
- [ ] Monitoring and alerts set up

## Cost Optimization

1. Use free tier for development
2. Scale up services as needed
3. Monitor usage and optimize
4. Consider reserved instances for production

## Next Steps

1. Connect custom domain (Render allows custom domains)
2. Set up monitoring and alerting
3. Configure auto-scaling if needed
4. Set up scheduled tasks or cron jobs
5. Enable persistent disks for uploads

## Support

- **Render Docs**: https://render.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **MongoDB Atlas**: https://docs.mongodb.com/atlas
