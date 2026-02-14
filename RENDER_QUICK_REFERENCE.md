# Render Deployment Quick Reference

## Dashboard URLs

| Service | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| Backend Service | https://photoflow-backend.onrender.com |
| Frontend Service | https://photoflow-frontend.onrender.com |
| GitHub Actions | https://github.com/YOUR_REPO/actions |
| MongoDB Atlas | https://cloud.mongodb.com |

## Service IDs & Keys to Keep Handy

```
Backend Service ID: srv_xxxxx
Frontend Service ID: srv_xxxxx
Render API Key: rnd_xxxxx
MongoDB URI: mongodb+srv://...
```

*Save these in a secure location*

## GitHub Secrets Added

```
RENDER_API_KEY
RENDER_SERVICE_ID_BACKEND
RENDER_SERVICE_ID_FRONTEND
REACT_APP_API_URL
```

## Environment Variables

### Backend (.env or Render Environment)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=https://photoflow-frontend.onrender.com
```

### Frontend (.env or Render Environment)
```
NODE_ENV=production
REACT_APP_API_URL=https://photoflow-backend.onrender.com
REACT_APP_FIREBASE_*=...
```

## Common Commands

### Trigger Deployment via GitHub
```bash
# Push changes to backend
git add backend/
git commit -m "Backend update"
git push origin main
# Workflow triggers automatically

# Push changes to frontend
git add frontend/
git commit -m "Frontend update"
git push origin main
# Workflow triggers automatically
```

### Manual Deployment (on Render)
1. Go to Render Dashboard
2. Select service
3. Click **Deploy latest** button
4. Check logs for errors

### Check Deployment Status

**GitHub Actions**
```
GitHub → Actions tab → Select workflow → View logs
```

**Render Logs**
```
Render Dashboard → Service → Logs tab
```

## Workflow Files

| File | Purpose | Triggers |
|------|---------|----------|
| `deploy-backend.yml` | Deploy backend to Render | Push to main, backend/ changed |
| `deploy-frontend.yml` | Deploy frontend to Render | Push to main, frontend/ changed |
| `backend-ci.yml` | Backend tests & validation | Push/PR to main or develop |
| `frontend-ci.yml` | Frontend build & tests | Push/PR to main or develop |

## Health Check Endpoints

```bash
# Backend health
curl https://photoflow-backend.onrender.com/health

# Frontend check
curl https://photoflow-frontend.onrender.com -I
```

## Monitoring

### Render Service Health
- Dashboard shows deployment status
- Green = Running, Red = Failed, Yellow = Building
- Click service to view detailed logs

### GitHub Actions
- All workflow runs listed in Actions tab
- Green checkmark = Success
- Red X = Failed
- Click run for detailed logs

### Database
- MongoDB Atlas Dashboard shows connection count
- Monitor quota usage
- Check error logs if connection fails

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| 503 Service Unavailable | Service not running - check logs |
| 502 Bad Gateway | Backend crash - restart service |
| Build failed | Check build command and logs |
| Deploy webhook failed | Verify RENDER_API_KEY is current |
| CORS errors | Check FRONTEND_URL matches frontend domain |
| 404 API endpoint | Verify backend service is running |
| Blank frontend page | Check REACT_APP_API_URL is correct |

## Emergency Restart

### Restart Backend Service
1. Render Dashboard → photoflow-backend
2. Settings → Instances → Restart
3. Or: Click Deploy latest

### Restart Frontend Service
1. Render Dashboard → photoflow-frontend
2. Settings → Instances → Restart
3. Or: Click Deploy latest

### Clear Frontend Cache
1. Render Dashboard → photoflow-frontend
2. Click Deploy latest with cache cleared option

## Managing Secrets

### Update GitHub Secret
```
GitHub Settings → Secrets → Select secret → Update value
```

### Update Render Env Var
```
Render Dashboard → Service → Environment → Edit → Save
```

### Rotate Credentials
1. Generate new API key or secret
2. Update in relevant platform (MongoDB, SendGrid, etc.)
3. Update in GitHub Secrets and/or Render Env Vars
4. Deploy services

## Database Maintenance

### Backup MongoDB
1. MongoDB Atlas Dashboard
2. Clusters → Three dots → Backup
3. Create backup snapshot

### Monitor Collections
```
MongoDB Atlas → Collections → View data size
```

### Check Connection String
```
MongoDB Atlas → Connect → Connection String
Verify it matches MONGODB_URI in Render
```

## Disable Auto-Deploy

If you want manual control:

**On Render Service:**
1. Settings → Auto Deploy
2. Turn OFF
3. Now deploy via GitHub Actions or manual Render button

**On GitHub Actions:**
1. Edit workflow file
2. Remove or modify `on:` trigger
3. Commit changes

## Re-Enable Auto-Deploy

**On GitHub:**
```bash
# Push changes to trigger workflow
git add .
git commit -m "Enable auto deploy"
git push origin main
```

## Logs to Check on Issues

**Backend Not Starting**
```
Render Logs → Look for:
- "Connected to MongoDB"
- "Server listening on"
- Any error messages
```

**Frontend Build Failed**
```
Render Logs → Look for:
- "npm install complete"
- "npm run build" errors
- Missing dependencies
```

**Deployment Failed**
```
GitHub Actions → Workflow logs
- Build step errors
- Deploy step errors
- Network issues
```

## Performance Monitoring

### Check Response Time
```bash
time curl https://photoflow-backend.onrender.com/
```

### Monitor Uptime
- Render Dashboard shows deployment history
- Use external monitoring services for better tracking

### Database Performance
- MongoDB Atlas shows query performance
- Check indexing on collections
- Monitor memory/CPU usage

## Cost Optimization

- Free tier includes 750 hours/month per service
- Monitor usage in Render Dashboard
- Scale up only when needed
- Use persistent disks for uploads sparingly
- Consider combining services if budget allows

## Useful Links

| Resource | URL |
|----------|-----|
| Render Docs | https://render.com/docs |
| GitHub Actions Docs | https://docs.github.com/actions |
| MongoDB Atlas Docs | https://docs.mongodb.com/atlas |
| Node.js Docs | https://nodejs.org/docs |
| Express Docs | https://expressjs.com |
| React Docs | https://react.dev |

---

**Last Updated**: February 14, 2026
**Status**: Production Ready ✅
