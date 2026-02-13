# AWS Deployment Implementation Checklist

## ✅ Phase 1: Prerequisites (30 minutes)

### Install Required Tools
- [ ] Install AWS CLI (`aws --version`)
- [ ] Install Docker Desktop (`docker --version`)
- [ ] Install Git (`git --version`)
- [ ] Verify Node.js 18+ installed (`node --version`)

### AWS Account Setup
- [ ] Create AWS Account (if needed)
- [ ] Generate AWS Access Keys
  - [ ] Access Key ID saved securely
  - [ ] Secret Access Key saved securely
- [ ] Create IAM User for CI/CD with permissions:
  - [ ] ECR permissions
  - [ ] ECS permissions
  - [ ] CloudWatch permissions
  - [ ] IAM role management
- [ ] Note AWS Account ID (12-digit number)
- [ ] Choose AWS Region (e.g., us-east-1)

### GitHub Repository
- [ ] Repository ready with code
- [ ] Both backend/ and frontend/ directories present
- [ ] package.json files in both directories
- [ ] Have GitHub admin access for adding secrets

---

## ✅ Phase 2: File Creation (Already Done!)

### GitHub Actions Workflow Files
- [x] `.github/workflows/deploy-aws.yml` - Main ECS workflow
- [x] `.github/workflows/deploy-aws-elastic-beanstalk.yml` - Alternative
- [x] Workflow files are valid YAML

### Docker Configuration
- [x] `backend/Dockerfile.prod` - Backend production image
- [x] `frontend/Dockerfile.prod` - Frontend production image
- [x] Docker images build locally without errors

### AWS Configuration Files
- [x] `backend-task-definition.json` - ECS backend task def
- [x] `frontend-task-definition.json` - ECS frontend task def
- [x] Task definition files are valid JSON

### Docker Compose
- [x] `docker-compose.prod.yml` - Local testing compose file
- [x] Includes MongoDB service
- [x] Includes health checks

### Documentation
- [x] `AWS_DEPLOYMENT_SETUP.md` - Comprehensive guide
- [x] `AWS_DEPLOYMENT_QUICK_REF.md` - Quick reference
- [x] `AWS_DEPLOYMENT_OPTIONS.md` - Comparison guide
- [x] `AWS_DEPLOYMENT_VISUAL_GUIDE.md` - Visual diagrams
- [x] `GITHUB_ACTIONS_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- [x] `.env.example` - Environment variables template

### Automation Scripts
- [x] `setup-aws.sh` - AWS setup automation script
- [x] Script has execute permissions (`chmod +x setup-aws.sh`)

---

## ✅ Phase 3: AWS Infrastructure Setup (45 minutes)

### Option A: Using Automated Script
- [ ] Run: `./setup-aws.sh`
- [ ] Script completes without errors
- [ ] Verify output:
  - [ ] ✅ Prerequisites checked
  - [ ] ✅ AWS configured
  - [ ] ✅ ECR repositories created
  - [ ] ✅ ECS cluster created
  - [ ] ✅ Log groups created

### Option B: Manual Setup

#### ECR Repositories
```bash
aws ecr create-repository --repository-name mivent-backend
aws ecr create-repository --repository-name mivent-frontend
```
- [ ] Backend ECR repository created
- [ ] Frontend ECR repository created

#### ECS Cluster
```bash
aws ecs create-cluster --cluster-name mivent-cluster
```
- [ ] ECS cluster created: `mivent-cluster`

#### CloudWatch Log Groups
```bash
aws logs create-log-group --log-group-name /ecs/mivent-backend
aws logs create-log-group --log-group-name /ecs/mivent-frontend
```
- [ ] Backend log group created
- [ ] Frontend log group created
- [ ] Retention policy set to 30 days

#### IAM Role (if needed)
- [ ] ECS task execution role exists
- [ ] Role has AmazonECSTaskExecutionRolePolicy attached

#### MongoDB Setup
- [ ] MongoDB provisioned (Atlas/RDS/Self-managed)
- [ ] Connection string obtained: `MONGODB_URI`
- [ ] IP whitelist configured (if Atlas)

---

## ✅ Phase 4: GitHub Secrets Configuration (15 minutes)

### Access GitHub Secrets Page
- [ ] Repository → Settings → Secrets and variables → Actions
- [ ] Ready to add secrets

### AWS Credentials Section
- [ ] Add `AWS_ACCESS_KEY_ID` - Your access key
- [ ] Add `AWS_SECRET_ACCESS_KEY` - Your secret key
- [ ] Add `AWS_ACCOUNT_ID` - 12-digit number
- [ ] Add `ECS_CLUSTER_NAME` - Value: `mivent-cluster`

### Backend Secrets
- [ ] Add `MONGODB_URI` - MongoDB connection string
- [ ] Add `JWT_SECRET` - Generate strong secret (32+ chars)
- [ ] Add `CLOUDINARY_NAME` - Cloudinary account name
- [ ] Add `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] Add `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] Add `EMAIL_SERVICE` - e.g., "gmail"
- [ ] Add `EMAIL_USER` - Email address
- [ ] Add `EMAIL_PASSWORD` - Email app-specific password

### Frontend Secrets
- [ ] Add `REACT_APP_API_URL` - Backend URL (e.g., https://api.mivent.com)
- [ ] Add `REACT_APP_FIREBASE_API_KEY` - Firebase API key
- [ ] Add `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] Add `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] Add `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] Add `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging ID
- [ ] Add `REACT_APP_FIREBASE_APP_ID` - Firebase app ID

### Optional Secrets
- [ ] Add `SLACK_WEBHOOK` - Slack webhook URL (optional)

### Verification
- [ ] Verify all 20+ secrets added
- [ ] Double-check secret values for typos
- [ ] Test with workflow run

---

## ✅ Phase 5: Local Testing (20 minutes)

### Build Verification
```bash
# Test backend build
docker build -f backend/Dockerfile.prod -t mivent-backend:test .

# Test frontend build
docker build -f frontend/Dockerfile.prod -t mivent-frontend:test .
```
- [ ] Backend Docker build succeeds
- [ ] Frontend Docker build succeeds
- [ ] Images created without errors

### Docker Compose Test
```bash
docker-compose -f docker-compose.prod.yml up
```
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:5000
- [ ] MongoDB running at localhost:27017
- [ ] All services healthy

### Health Checks
- [ ] Frontend responds to requests
- [ ] Backend health endpoint works (`/health`)
- [ ] Docker services stop cleanly with Ctrl+C

---

## ✅ Phase 6: Task Definition Registration (10 minutes)

### Prepare Task Definitions
```bash
# Replace ACCOUNT_ID placeholders
sed -i 's/ACCOUNT_ID/YOUR_AWS_ACCOUNT_ID/g' backend-task-definition.json
sed -i 's/ACCOUNT_ID/YOUR_AWS_ACCOUNT_ID/g' frontend-task-definition.json
```
- [ ] Backend task definition updated with Account ID
- [ ] Frontend task definition updated with Account ID

### Register Task Definitions
```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```
- [ ] Backend task definition registered (version 1)
- [ ] Frontend task definition registered (version 1)
- [ ] Verify with: `aws ecs list-task-definitions`

---

## ✅ Phase 7: ECS Services Creation (15 minutes)

### Get VPC Information
```bash
aws ec2 describe-vpcs --query 'Vpcs[0].VpcId'
aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,VpcId]'
aws ec2 describe-security-groups --query 'SecurityGroups[0].GroupId'
```
- [ ] VPC ID noted
- [ ] At least 2 Subnet IDs noted
- [ ] Security Group ID noted (allow ports 5000 and 3000)

### Create Backend Service
```bash
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-backend-service \
  --task-definition mivent-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```
- [ ] Backend service created
- [ ] Service name: `mivent-backend-service`
- [ ] Desired count: 2 tasks

### Create Frontend Service
```bash
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-frontend-service \
  --task-definition mivent-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```
- [ ] Frontend service created
- [ ] Service name: `mivent-frontend-service`
- [ ] Desired count: 2 tasks

### Verify Services
```bash
aws ecs describe-services --cluster mivent-cluster --services mivent-backend-service mivent-frontend-service
```
- [ ] Both services show "Active" status
- [ ] Running count shows tasks starting
- [ ] No deployment errors

---

## ✅ Phase 8: GitHub Actions Testing (10 minutes)

### Push to Develop Branch
```bash
git add .
git commit -m "Add AWS deployment pipeline"
git push origin develop
```
- [ ] All files committed
- [ ] Pushed to develop branch
- [ ] GitHub Actions workflow triggered

### Monitor First Run
- [ ] Go to GitHub → Actions tab
- [ ] Watch the workflow execute
- [ ] Check each job status:
  - [ ] ✅ build-backend job completes
  - [ ] ✅ build-frontend job completes
  - [ ] ⏭️ deploy job skipped (develop branch doesn't deploy by default)

### Review Logs
- [ ] Click on successful job
- [ ] Verify Docker images built successfully
- [ ] Verify push to ECR successful
- [ ] No errors in logs

### First Deployment (Main Branch)
```bash
git push origin main  # Or create PR and merge
```
- [ ] Push to main branch triggers deployment
- [ ] All 3 jobs run: build-backend, build-frontend, deploy
- [ ] Deploy job completes successfully
- [ ] Slack notification received (if configured)

---

## ✅ Phase 9: Verify Deployment (15 minutes)

### Check ECS Tasks
```bash
aws ecs list-tasks --cluster mivent-cluster --service-name mivent-backend-service
aws ecs describe-tasks --cluster mivent-cluster --tasks <task-arn>
```
- [ ] Backend tasks running (2 instances)
- [ ] Frontend tasks running (2 instances)
- [ ] Task status: RUNNING

### Check CloudWatch Logs
```bash
aws logs tail /ecs/mivent-backend --follow
aws logs tail /ecs/mivent-frontend --follow
```
- [ ] Backend logs appear and show healthy startup
- [ ] Frontend logs appear and show healthy startup
- [ ] No error messages in logs
- [ ] Health checks passing

### Check Health Endpoints
```bash
# Get backend service IP
aws ecs describe-tasks --cluster mivent-cluster --tasks <backend-task-arn> \
  --query 'tasks[0].containers[0].networkBindings[0].bindAddr'

# Test health
curl http://<ip>:5000/health
```
- [ ] Backend health endpoint responds with 200 OK
- [ ] Frontend accessible via load balancer or service IP

### Load Balancer (if configured)
- [ ] Load balancer created (optional step, can configure later)
- [ ] Target groups configured
- [ ] Health checks configured for both services
- [ ] Service accessible via ALB URL

---

## ✅ Phase 10: Production Verification (10 minutes)

### Test Workflow on Main Branch
- [ ] Make a code change in a feature branch
- [ ] Create pull request to main
- [ ] Verify PR checks run (build & test only, no deploy)
- [ ] Review deployment readiness

### Merge to Main
- [ ] All checks pass on PR
- [ ] Code review approved
- [ ] Merge PR to main branch
- [ ] Verify deployment workflow triggers

### Deployment Complete
- [ ] All workflow jobs complete successfully
- [ ] New Docker images pushed to ECR
- [ ] ECS services updated
- [ ] New tasks running with latest code
- [ ] CloudWatch logs show new deployment
- [ ] Application accessible with new changes
- [ ] Slack notification sent (if configured)

---

## ✅ Phase 11: Monitoring Setup (Optional but Recommended)

### CloudWatch Alarms
- [ ] Create CPU utilization alarm (threshold: 80%)
- [ ] Create memory utilization alarm (threshold: 80%)
- [ ] Create task count alarm (alert if tasks < desired)
- [ ] Set SNS topic for notifications

### Auto-Scaling (Optional)
- [ ] Register scalable target for backend service
- [ ] Register scalable target for frontend service
- [ ] Create scaling policy (target tracking CPU at 70%)
- [ ] Set min/max capacity (min: 1, max: 10)

### Dashboard
- [ ] Create CloudWatch dashboard
- [ ] Add ECS service metrics
- [ ] Add task metrics
- [ ] Add log insights widgets

---

## ✅ Phase 12: Security Review (Checklist)

### Secrets Management
- [ ] No secrets committed to GitHub
- [ ] All sensitive values in GitHub Secrets
- [ ] Secrets masked in workflow logs
- [ ] AWS credentials rotated if copied

### Container Security
- [ ] Dockerfile uses specific base image versions (not latest)
- [ ] Multi-stage builds used to minimize image size
- [ ] No sensitive data in Docker images
- [ ] Container scans enabled in ECR

### AWS Security
- [ ] IAM user has minimal required permissions
- [ ] Security groups restrict unnecessary ports
- [ ] ECS tasks use task execution role
- [ ] CloudTrail enabled for audit logging

### Network Security
- [ ] VPC configured with private subnets (recommended)
- [ ] Security groups restrict ingress to necessary ports only
- [ ] HTTPS/TLS certificates configured on ALB
- [ ] Origin IP restrictions set if needed

---

## ✅ Phase 13: Documentation & Training

### Team Documentation
- [ ] Share AWS_DEPLOYMENT_SETUP.md with team
- [ ] Share AWS_DEPLOYMENT_QUICK_REF.md with team
- [ ] Share AWS_DEPLOYMENT_VISUAL_GUIDE.md with team
- [ ] Document custom configurations

### Team Training
- [ ] Explain workflow to development team
- [ ] Train on common troubleshooting
- [ ] Share deployment procedures
- [ ] Document rollback procedures

### README Updates
- [ ] Update project README with deployment instructions
- [ ] Add link to AWS deployment documentation
- [ ] Document environment variables needed
- [ ] Add GitHub Actions badge to README

---

## ✅ Phase 14: Ongoing Maintenance

### Regular Checks
- [ ] Monitor CloudWatch dashboards weekly
- [ ] Check logs for errors
- [ ] Review cost trends monthly
- [ ] Test rollback procedure quarterly

### Updates & Patches
- [ ] Keep base Docker images updated
- [ ] Update Node.js version as needed
- [ ] Update dependencies periodically
- [ ] Review security advisories

### Performance Optimization
- [ ] Monitor deployment frequency
- [ ] Optimize Docker build times
- [ ] Review auto-scaling efficiency
- [ ] Optimize database queries

### Cost Optimization
- [ ] Review AWS billing monthly
- [ ] Consider Fargate Spot for non-production
- [ ] Clean up unused ECR images
- [ ] Review CloudWatch retention settings

---

## 📊 Success Metrics

### Deployment Metrics
- [ ] ✅ 0 manual deployments (all via GitHub Actions)
- [ ] ✅ 100% deployment success rate on main branch
- [ ] ✅ Average deployment time < 10 minutes
- [ ] ✅ Rollback capability < 2 minutes

### Application Metrics
- [ ] ✅ Task CPU utilization < 70%
- [ ] ✅ Task memory utilization < 80%
- [ ] ✅ Application response time < 500ms
- [ ] ✅ Error rate < 1%

### Operational Metrics
- [ ] ✅ All logs visible in CloudWatch
- [ ] ✅ Health checks passing consistently
- [ ] ✅ Zero unplanned downtime
- [ ] ✅ Team confident with deployments

---

## 🎯 Completion Status

**Phase 1:** ⬜ ⬜ ⬜ 
**Phase 2:** ✅ ✅ ✅ (Complete)
**Phase 3:** ⬜ ⬜ ⬜
**Phase 4:** ⬜ ⬜ ⬜
**Phase 5:** ⬜ ⬜ ⬜
**Phase 6:** ⬜ ⬜ ⬜
**Phase 7:** ⬜ ⬜ ⬜
**Phase 8:** ⬜ ⬜ ⬜
**Phase 9:** ⬜ ⬜ ⬜
**Phase 10:** ⬜ ⬜ ⬜
**Phase 11:** ⬜ ⬜ ⬜ (Optional)
**Phase 12:** ⬜ ⬜ ⬜
**Phase 13:** ⬜ ⬜ ⬜
**Phase 14:** ⬜ ⬜ ⬜ (Ongoing)

---

## 📞 Support & Help

**If you encounter issues:**
1. Check `AWS_DEPLOYMENT_SETUP.md` troubleshooting section
2. Review CloudWatch logs for errors
3. Check GitHub Actions run logs
4. Verify all GitHub Secrets are set correctly
5. Consult AWS documentation
6. Review the visual guide for architecture reference

**Key Resources:**
- AWS ECS: https://docs.aws.amazon.com/ecs/
- GitHub Actions: https://docs.github.com/en/actions
- Docker: https://docs.docker.com/
- AWS CloudWatch: https://docs.aws.amazon.com/cloudwatch/

---

**Last Updated: February 2026**
**Estimated Total Setup Time: 3-4 hours**
