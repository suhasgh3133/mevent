# Render Deployment Setup Checklist

Complete these steps to deploy your application to Render with GitHub Actions CI/CD.

## Phase 1: Prepare Your GitHub Repository

- [ ] Repository is public and on GitHub
- [ ] All code pushed to `main` branch
- [ ] `.github/workflows/` folder contains 4 workflow files:
  - [ ] `deploy-backend.yml`
  - [ ] `deploy-frontend.yml`
  - [ ] `backend-ci.yml`
  - [ ] `frontend-ci.yml`
- [ ] `render-backend.yaml` and `render-frontend.yaml` exist in root
- [ ] `server.js` file exists in backend folder
- [ ] `package.json` in frontend includes `serve` package
- [ ] Dockerfiles are present:
  - [ ] `backend/Dockerfile.prod`
  - [ ] `frontend/Dockerfile.prod`

## Phase 2: Create MongoDB Database

- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a free cluster
- [ ] Create database user with password
- [ ] Get connection string in format: `mongodb+srv://user:password@cluster.mongodb.net/database`
- [ ] Whitelist IP `0.0.0.0/0` in Network Access (or specific Render IPs)
- [ ] Save connection string - you'll need it later

## Phase 3: Gather Service Credentials

Collect all the following credentials (keep them secure):

### Authentication & Database
- [ ] MongoDB connection string
- [ ] JWT Secret (generate a random string or use `openssl rand -hex 32`)

### Email Service (SendGrid)
- [ ] SendGrid API key (https://sendgrid.com)
- [ ] Sender email address

### Storage (Cloudinary)
- [ ] Cloudinary Cloud Name
- [ ] Cloudinary API Key
- [ ] Cloudinary API Secret

### Payments (Razorpay)
- [ ] Razorpay Key ID
- [ ] Razorpay Key Secret

### Firebase
- [ ] Firebase API Key
- [ ] Firebase Auth Domain
- [ ] Firebase Project ID
- [ ] Firebase Storage Bucket
- [ ] Firebase Messaging Sender ID
- [ ] Firebase App ID

## Phase 4: Create Services on Render

### Create Backend Service
- [ ] Go to https://dashboard.render.com
- [ ] Click **New +** → **Web Service**
- [ ] Connect GitHub account and select repository
- [ ] Configure:
  - Name: `photoflow-backend`
  - Root Directory: `backend` (optional, depends on Render config)
  - Runtime: `Node`
  - Region: Select your region
  - Build Command: `cd backend && npm ci`
  - Start Command: `cd backend && npm run prod`
  - Plan: Select Free or Paid
- [ ] Click **Create Web Service** (don't deploy yet)
- [ ] Copy the **Service ID** from the URL (format: `srv_xxxxx`)
- [ ] Save it - you'll need for GitHub secrets

### Create Frontend Service
- [ ] Click **New +** → **Web Service** again
- [ ] Same repository, different branch if desired
- [ ] Configure:
  - Name: `photoflow-frontend`
  - Root Directory: `frontend`
  - Runtime: `Node`
  - Region: Same as backend
  - Build Command: `cd frontend && npm ci && npm run build`
  - Start Command: `cd frontend && npm run start`
  - Plan: Select Free or Paid
- [ ] Click **Create Web Service**
- [ ] Copy the **Service ID**
- [ ] Save it

## Phase 5: Get Render API Key

- [ ] Go to Render Dashboard
- [ ] Click your profile icon (top right) → **Account Settings**
- [ ] Scroll to **API Keys**
- [ ] Click **Create API Key**
- [ ] Copy the key (you won't see it again)
- [ ] Save it somewhere secure

## Phase 6: Configure GitHub Secrets

- [ ] Go to your GitHub repository
- [ ] Click **Settings** → **Secrets and variables** → **Actions**
- [ ] Click **New repository secret** for each:

| Secret Name | Value |
|---|---|
| `RENDER_API_KEY` | Render API key from Phase 5 |
| `RENDER_SERVICE_ID_BACKEND` | Backend service ID from Phase 4 |
| `RENDER_SERVICE_ID_FRONTEND` | Frontend service ID from Phase 4 |
| `REACT_APP_API_URL` | `https://photoflow-backend.onrender.com` |

## Phase 7: Configure Render Backend Environment Variables

- [ ] Go to Render Dashboard → **photoflow-backend** service
- [ ] Click **Environment** tab
- [ ] Add environment variables:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = <your_mongodb_connection_string>
JWT_SECRET = <your_jwt_secret>
FRONTEND_URL = https://photoflow-frontend.onrender.com
SENDGRID_API_KEY = <your_sendgrid_key>
CLOUDINARY_CLOUD_NAME = <your_cloudinary_name>
CLOUDINARY_API_KEY = <your_cloudinary_key>
CLOUDINARY_API_SECRET = <your_cloudinary_secret>
RAZORPAY_KEY_ID = <your_razorpay_id>
RAZORPAY_KEY_SECRET = <your_razorpay_secret>
```

- [ ] Click **Save Changes**

## Phase 8: Configure Render Frontend Environment Variables

- [ ] Go to Render Dashboard → **photoflow-frontend** service
- [ ] Click **Environment** tab
- [ ] Add environment variables:

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

- [ ] Click **Save Changes**

## Phase 9: First Deployment

### Manual Deployment (Recommended First Time)
- [ ] In Render Backend service, click **Deploy latest** button
- [ ] Watch logs in **Logs** tab
- [ ] Verify successful startup with `Server listening on` message
- [ ] Repeat for Frontend service

### Verify Services are Running
- [ ] Backend: Visit `https://photoflow-backend.onrender.com/`
- [ ] Frontend: Visit `https://photoflow-frontend.onrender.com`
- [ ] Both should load without errors

## Phase 10: GitHub Actions Setup

### Test Push to Trigger Workflows
- [ ] Make a small change to `backend/` folder
- [ ] Push to `main` branch
- [ ] Go to GitHub **Actions** tab
- [ ] Verify `backend-ci.yml` workflow runs
- [ ] Verify `deploy-backend.yml` workflow runs
- [ ] Wait for deployment to complete on Render
- [ ] Repeat test with `frontend/` folder changes

### Monitor Logs
- [ ] GitHub Actions logs at `https://github.com/YOUR_REPO/actions`
- [ ] Render logs at `https://dashboard.render.com/services`

## Phase 11: Post-Deployment Verification

### Test Backend API
```bash
curl https://photoflow-backend.onrender.com/
# Should return: {"message": "Photoflow demo backend (express)"}
```

### Test Frontend
```bash
curl https://photoflow-frontend.onrender.com/
# Should return HTML page
```

### Test Database Connection
- [ ] Backend logs show `Connected to MongoDB`
- [ ] Try creating an account/logging in on frontend
- [ ] Verify data persists in MongoDB Atlas

### Test Email Service
- [ ] Try password reset functionality
- [ ] Check if email is sent (check SendGrid logs)

## Phase 12: Configure Custom Domain (Optional)

- [ ] On each Render service, go to **Settings**
- [ ] Under **Custom Domain**, add your domain
- [ ] Follow DNS setup instructions
- [ ] Update `FRONTEND_URL` in backend env vars if changed

## Phase 13: Ongoing Monitoring

- [ ] Set up email alerts in Render (Settings → Notifications)
- [ ] Monitor service health on Render Dashboard
- [ ] Check logs regularly for errors
- [ ] Monitor MongoDB Atlas for quota usage
- [ ] Monitor GitHub Actions for failed deployments

## Troubleshooting

### If Backend Won't Deploy
- [ ] Check all environment variables are set
- [ ] Verify MongoDB connection string is correct
- [ ] Check Render logs for specific error messages
- [ ] Ensure `backend/server.js` exists
- [ ] Verify `backend/package.json` has correct scripts

### If Frontend Won't Build
- [ ] Check build command: `cd frontend && npm ci && npm run build`
- [ ] Verify React environment variables are prefixed with `REACT_APP_`
- [ ] Check for TypeScript errors if using TS files
- [ ] Verify all npm dependencies are installed

### If GitHub Actions Won't Trigger
- [ ] Verify secrets are set correctly in GitHub
- [ ] Check workflow files have correct trigger conditions
- [ ] Verify branch is `main` (or configured branch)
- [ ] Check file paths in `paths:` sections of workflows

### If CI Passes But Deploy Doesn't
- [ ] Verify RENDER_API_KEY is still valid
- [ ] Verify RENDER_SERVICE_ID_* matches actual services
- [ ] Check Render API status
- [ ] Try manual deployment from Render Dashboard

## Next Steps

Once deployment is working:
1. **Enable auto-deploy** in Render (Settings → Auto Deploy)
2. **Set up monitoring** with health checks
3. **Configure CDN** for static assets if needed
4. **Add custom domain** for production
5. **Set up logging** with better observability
6. **Configure auto-scaling** for high traffic

## Support Links

- Render Docs: https://render.com/docs
- GitHub Actions: https://docs.github.com/en/actions
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
- Troubleshooting: See `RENDER_DEPLOYMENT_GUIDE.md`

---

**Status**: [ ] Complete - Ready for Production
