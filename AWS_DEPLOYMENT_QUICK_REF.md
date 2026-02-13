# AWS Deployment Quick Reference

## File Structure

```
.github/
  workflows/
    deploy-aws.yml              # Main GitHub Actions workflow
backend/
  Dockerfile.prod              # Production Docker image for backend
frontend/
  Dockerfile.prod              # Production Docker image for frontend
.env.example                   # Example environment variables
docker-compose.prod.yml        # Docker Compose for local testing
AWS_DEPLOYMENT_SETUP.md        # Detailed setup guide
AWS_DEPLOYMENT_QUICK_REF.md    # This file
backend-task-definition.json   # ECS task definition for backend
frontend-task-definition.json  # ECS task definition for frontend
setup-aws.sh                   # Bash script to set up AWS infrastructure
```

## Quick Setup (5 Steps)

### Step 1: Prerequisites
```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Install Docker
# Download from https://www.docker.com/products/docker-desktop

# Install Git
# Already have it? Great!
```

### Step 2: Run Setup Script
```bash
chmod +x setup-aws.sh
./setup-aws.sh
```

### Step 3: Create GitHub Secrets
Go to GitHub → Settings → Secrets and variables → Actions

**Required Secrets:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ACCOUNT_ID
ECS_CLUSTER_NAME = mivent-cluster
```

**Backend Secrets:**
```
MONGODB_URI
JWT_SECRET
CLOUDINARY_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_SERVICE
EMAIL_USER
EMAIL_PASSWORD
```

**Frontend Secrets:**
```
REACT_APP_API_URL
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

### Step 4: Register Task Definitions
```bash
# Replace ACCOUNT_ID in both files
sed -i 's/ACCOUNT_ID/YOUR_ACCOUNT_ID/g' backend-task-definition.json
sed -i 's/ACCOUNT_ID/YOUR_ACCOUNT_ID/g' frontend-task-definition.json

# Register backend
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json

# Register frontend
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

### Step 5: Create ECS Services
```bash
# Get your VPC and Subnet IDs
aws ec2 describe-vpcs --query 'Vpcs[0].VpcId'
aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,VpcId]'

# Create backend service
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-backend-service \
  --task-definition mivent-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Create frontend service
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-frontend-service \
  --task-definition mivent-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## Common Commands

### View Deployment Status
```bash
# Check service status
aws ecs describe-services \
  --cluster mivent-cluster \
  --services mivent-backend-service mivent-frontend-service

# View recent tasks
aws ecs list-tasks --cluster mivent-cluster --serviceName mivent-backend-service

# View task details
aws ecs describe-tasks \
  --cluster mivent-cluster \
  --tasks <task-arn>
```

### View Logs
```bash
# Backend logs
aws logs tail /ecs/mivent-backend --follow

# Frontend logs
aws logs tail /ecs/mivent-frontend --follow

# Follow from specific timestamp
aws logs tail /ecs/mivent-backend --follow --since 1h
```

### Update Deployment
```bash
# Force new deployment
aws ecs update-service \
  --cluster mivent-cluster \
  --service mivent-backend-service \
  --force-new-deployment

# Update specific image
aws ecs update-service \
  --cluster mivent-cluster \
  --service mivent-backend-service \
  --task-definition mivent-backend:2
```

### Local Testing
```bash
# Build locally
docker-compose -f docker-compose.prod.yml build

# Run locally
docker-compose -f docker-compose.prod.yml up

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag mivent-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mivent-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mivent-backend:latest
```

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://api.mivent.com
REACT_APP_FIREBASE_API_KEY=your-firebase-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc123
```

## Scaling

### Auto Scaling
```bash
# Enable auto scaling for backend
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/mivent-cluster/mivent-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name backend-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/mivent-cluster/mivent-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{"TargetValue":70.0,"PredefinedMetricSpecification":{"PredefinedMetricType":"ECSServiceAverageCPUUtilization"}}'
```

## Cost Monitoring

```bash
# Enable billing alerts
aws ce put-anomaly-detector --anomaly-detector '{
  "AnomalyDetector": {
    "Frequency": "DAILY"
  }
}'

# View current costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics BlendedCost
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Task not starting | Check CloudWatch logs; verify environment variables |
| ECR push fails | Verify AWS credentials; check ECR repository exists |
| Service not healthy | Check security groups; verify application health check |
| High CPU/Memory | Scale up instance type; optimize application code |
| Slow deployments | Use Fargate Spot; increase task count before rollout |

## Important Links

- [AWS ECS Console](https://console.aws.amazon.com/ecs/)
- [AWS ECR Console](https://console.aws.amazon.com/ecr/)
- [CloudWatch Logs](https://console.aws.amazon.com/logs/)
- [GitHub Actions](https://github.com/your-repo/actions)

## Support

Refer to [AWS_DEPLOYMENT_SETUP.md](AWS_DEPLOYMENT_SETUP.md) for detailed troubleshooting and advanced configuration.
