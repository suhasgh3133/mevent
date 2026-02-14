# GitHub Actions Quick Setup

## Quick Reference for Setting Up CI/CD

### 1. GitHub Secrets to Add

Go to: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Notes |
|---|---|---|
| `RENDER_API_KEY` | Your Render API key | Get from Render Account Settings |
| `RENDER_SERVICE_ID_BACKEND` | Backend service ID | Found in Render service URL or settings |
| `RENDER_SERVICE_ID_FRONTEND` | Frontend service ID | Found in Render service URL or settings |
| `REACT_APP_API_URL` | `https://photoflow-backend.onrender.com` | Backend API endpoint |

### 2. Backend Environment Variables (On Render)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your_mongodb_string>
JWT_SECRET=<generate_a_secret>
FRONTEND_URL=https://photoflow-frontend.onrender.com
```

### 3. Frontend Environment Variables (On Render)

```
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=https://photoflow-backend.onrender.com
REACT_APP_FIREBASE_*=<your_firebase_config>
```

### 4. Workflows Triggered

| Workflow | Trigger | Action |
|---|---|---|
| `backend-ci.yml` | Push to backend/ | Runs tests, validates code |
| `frontend-ci.yml` | Push to frontend/ | Builds, tests, uploads artifacts |
| `deploy-backend.yml` | Push to main, backend/ changed | Deploys to Render |
| `deploy-frontend.yml` | Push to main, frontend/ changed | Deploys to Render |

### 5. First Deployment

1. Set all secrets in GitHub
2. Set all env vars on Render services
3. Push to main branch
4. Check Actions tab for workflow runs
5. Monitor Render logs

### 6. Verify Deployment

```bash
# Test backend
curl https://photoflow-backend.onrender.com/api/auth/health

# Test frontend
curl https://photoflow-frontend.onrender.com
```

## Workflow Files

- `.github/workflows/backend-ci.yml` - Backend CI pipeline
- `.github/workflows/frontend-ci.yml` - Frontend CI pipeline
- `.github/workflows/deploy-backend.yml` - Backend deployment
- `.github/workflows/deploy-frontend.yml` - Frontend deployment

## Render Configuration Files

- `render-backend.yaml` - Backend service config
- `render-frontend.yaml` - Frontend service config

## Disabling Auto-Deploy

If you don't want auto-deploy on every push:
1. On Render service page, go to **Settings**
2. Under Deploy Hook, disable auto-deploy
3. Manually trigger via GitHub Actions instead
