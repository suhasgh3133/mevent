# Environment Variables Templates

Use these templates to configure your services. Copy the sections you need.

## Backend Environment Variables

### Render Dashboard - Backend Service Environment

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/photoflow
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://photoflow-frontend.onrender.com
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourapp.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Minimal Configuration (Test/Demo)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/photoflow
JWT_SECRET=demo_secret_key_change_in_production
FRONTEND_URL=https://photoflow-frontend.onrender.com
```

### With Firebase

Add these if using Firebase authentication:

```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

---

## Frontend Environment Variables

### Render Dashboard - Frontend Service Environment

```
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=https://photoflow-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_DATABASE_URL=your_firebase_database_url
```

### Minimal Configuration (Test/Demo)

```
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=https://photoflow-backend.onrender.com
```

---

## How to Find Your Credentials

### MongoDB Connection String
1. MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>`, `<password>`, `<database>`
5. Format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### JWT Secret
Generate a secure secret:
```bash
# On Mac/Linux:
openssl rand -hex 32

# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) | % {$_.Substring(0,32)}
```

Or use an online generator:
- https://generate-random.org/

**Important**: Use same JWT_SECRET across backend deployments for token validity

### Firebase Credentials
1. Firebase Console → Project Settings
2. Service Accounts → Generate New Private Key (for backend)
3. Click on Firebase config (for frontend)
4. Copy the credentials

### SendGrid API Key
1. SendGrid Dashboard → Settings → API Keys
2. Create new API key
3. Copy the key
4. Also note your sender email

### Cloudinary Credentials
1. Cloudinary Dashboard → Settings → Account
2. Copy Cloud Name, API Key, and API Secret
3. Keep API Secret secure!

### Razorpay Credentials
1. Razorpay Dashboard → Settings → API Keys
2. Copy Key ID and Key Secret
3. Keep Key Secret secure!

---

## Environment Variable Guidelines

### Security Best Practices

✅ DO:
- Use strong, random secrets (32+ characters)
- Rotate secrets every 90 days
- Use different secrets per environment
- Store in Render (not in code)
- Encrypt sensitive data
- Use HTTPS for all communications

❌ DON'T:
- Hardcode secrets in code
- Commit secrets to Git
- Share secrets via email
- Use weak or predictable secrets
- Log sensitive values
- Use same secret across environments

### Naming Conventions

- `NODE_ENV` - Set to `production` on Render
- `PORT` - Leave as 5000 for backend, 3000 for frontend
- `REACT_APP_*` - Frontend variables (must prefix with `REACT_APP_`)
- Service credentials - Use service name prefix: `SENDGRID_`, `CLOUDINARY_`, etc.

### Special Cases

#### Multiple Frontend URLs
If you have multiple frontend domains:
```
FRONTEND_URL=https://photoflow-frontend.onrender.com,https://custom-domain.com
# Update backend to split and add to CORS
```

#### Development vs Production
Development might need:
```
NODE_ENV=development
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/photoflow-dev
```

Production should have:
```
NODE_ENV=production
LOG_LEVEL=warn
MONGODB_URI=mongodb+srv://...
```

#### Database Replication
For high availability, MongoDB URI might be:
```
mongodb+srv://user:pass@server1,server2,server3.mongodb.net/dbname
```

---

## Environment File Examples

### .env.local (for development, add to .gitignore)

```
# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/photoflow
JWT_SECRET=dev_secret_key
FRONTEND_URL=http://localhost:3000

# Services
SENDGRID_API_KEY=your_dev_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### .env.production (for reference only, use Render env vars)

```
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/photoflow
JWT_SECRET=your_production_secret
FRONTEND_URL=https://photoflow-frontend.onrender.com

# Services (from Render environment)
SENDGRID_API_KEY=production_key
```

---

## Verification Checklist

After setting environment variables on Render:

### Backend Service
- [ ] Server starts with "Server listening on http://localhost:5000"
- [ ] MongoDB connection succeeds
- [ ] API responds at /api/auth/health (or similar)
- [ ] CORS allows frontend domain
- [ ] Email service works (test with password reset)
- [ ] File uploads work (if using Cloudinary)

### Frontend Service
- [ ] Build completes successfully
- [ ] App loads at service URL
- [ ] API calls succeed to backend
- [ ] Authentication works
- [ ] Firebase features work (if using)
- [ ] Images load properly

---

## Secrets Rotation Schedule

### Every 30 Days
- [ ] Review all credentials
- [ ] Check for unauthorized access
- [ ] Update last-reviewed date

### Every 90 Days
- [ ] Rotate JWT_SECRET (requires redeployment)
- [ ] Rotate API keys (SendGrid, Cloudinary, etc.)
- [ ] Generate new MongoDB credentials

### Immediately
- [ ] If credentials are exposed
- [ ] If someone with access leaves
- [ ] If suspicious activity detected
- [ ] After security incident

---

## Testing Environment Variables

### Test Backend Config
```bash
curl https://photoflow-backend.onrender.com/
# Should return JSON response without errors
```

### Test Frontend Config
```bash
curl https://photoflow-frontend.onrender.com
# Should return HTML (no error messages in console logs)
```

### Check Render Logs
```
Render Dashboard → Service → Logs
# Should show: "Server listening on http://localhost:PORT"
# Should show: "Connected to MongoDB"
```

---

## Quick Copy-Paste Templates

### Backend (Minimal)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=https://photoflow-frontend.onrender.com
```

### Backend (Full)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=https://photoflow-frontend.onrender.com
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Frontend (Minimal)
```
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=https://photoflow-backend.onrender.com
```

### Frontend (Full)
```
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=https://photoflow-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

---

## Support

If environment variables aren't working:

1. Check Render Environment tab - verify they're set
2. Check logs for "undefined variable" errors
3. Restart service after changing variables
4. Check variable names match code exactly
5. For React: variables must start with `REACT_APP_`

---

**Last Updated**: February 14, 2026
