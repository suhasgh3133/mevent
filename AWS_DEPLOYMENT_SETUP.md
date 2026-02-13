# AWS Deployment Setup Guide for MIVENT

This guide will help you set up the GitHub Actions pipeline for automatic deployment of the MIVENT application to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub Repository
- Docker installed locally (for testing)
- AWS CLI installed locally

## Step 1: Set Up AWS Infrastructure

### 1.1 Create ECR Repositories

```bash
# Login to AWS
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name mivent-backend --region us-east-1
aws ecr create-repository --repository-name mivent-frontend --region us-east-1
```

### 1.2 Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name mivent-cluster --region us-east-1

# Create task execution role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 1.3 Create RDS Database (Optional)

If using RDS instead of self-managed MongoDB:

```bash
aws rds create-db-instance \
  --db-instance-identifier mivent-db \
  --db-instance-class db.t3.micro \
  --engine mongo \
  --allocated-storage 20 \
  --master-username admin \
  --master-user-password <YOUR_SECURE_PASSWORD>
```

### 1.4 Create Application Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name mivent-alb \
  --subnets <subnet-id-1> <subnet-id-2> \
  --security-groups <sg-id> \
  --type application \
  --region us-east-1
```

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key
- `AWS_ACCOUNT_ID` - Your AWS account ID (12 digits)

### AWS Configuration
- `ECS_CLUSTER_NAME` - Value: `mivent-cluster`

### Environment Variables (Backend)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `CLOUDINARY_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_SERVICE` - Email service provider (e.g., gmail)
- `EMAIL_USER` - Email address
- `EMAIL_PASSWORD` - Email password or app-specific password

### Environment Variables (Frontend)
- `REACT_APP_API_URL` - Your backend API URL (e.g., https://api.mivent.com)
- `REACT_APP_FIREBASE_API_KEY` - Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID` - Firebase app ID

### Optional
- `SLACK_WEBHOOK` - Slack webhook URL for deployment notifications

## Step 3: Create ECS Task Definitions

### Backend Task Definition

Create file: `backend-task-definition.json`

```json
{
  "family": "mivent-backend",
  "containerDefinitions": [
    {
      "name": "mivent-backend",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mivent-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:mivent/mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:mivent/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mivent-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "memory": 512,
      "cpu": 256
    }
  ],
  "executionRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "networkMode": "awsvpc"
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
```

### Frontend Task Definition

Create file: `frontend-task-definition.json`

```json
{
  "family": "mivent-frontend",
  "containerDefinitions": [
    {
      "name": "mivent-frontend",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mivent-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "REACT_APP_API_URL",
          "value": "https://api.mivent.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mivent-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "memory": 256,
      "cpu": 128
    }
  ],
  "executionRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "128",
  "memory": "256",
  "networkMode": "awsvpc"
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

## Step 4: Create ECS Services

### Backend Service

```bash
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-backend-service \
  --task-definition mivent-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/mivent-backend/xxx,containerName=mivent-backend,containerPort=5000 \
  --region us-east-1
```

### Frontend Service

```bash
aws ecs create-service \
  --cluster mivent-cluster \
  --service-name mivent-frontend-service \
  --task-definition mivent-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/mivent-frontend/xxx,containerName=mivent-frontend,containerPort=3000 \
  --region us-east-1
```

## Step 5: Set Up CloudWatch Logs

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/mivent-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/mivent-frontend --region us-east-1

# Set retention policy
aws logs put-retention-policy --log-group-name /ecs/mivent-backend --retention-in-days 30
aws logs put-retention-policy --log-group-name /ecs/mivent-frontend --retention-in-days 30
```

## Step 6: Set Up Monitoring & Alerts

### CloudWatch Alarms

```bash
# Backend CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name mivent-backend-cpu \
  --alarm-description "Backend CPU Utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=mivent-backend-service Name=ClusterName,Value=mivent-cluster

# Backend Memory Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name mivent-backend-memory \
  --alarm-description "Backend Memory Utilization" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=mivent-backend-service Name=ClusterName,Value=mivent-cluster
```

## Step 7: GitHub Actions Workflow

The workflow file `.github/workflows/deploy-aws.yml` has been created with the following stages:

1. **Build Backend** - Builds Docker image and pushes to ECR
2. **Build Frontend** - Builds React app and Docker image, pushes to ECR
3. **Deploy** - Updates ECS services with new images
4. **Notify** - Sends Slack notification on success/failure

### Trigger Conditions

The pipeline runs on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` or `develop`

Only pushes trigger deployment; PRs only run tests and build verification.

## Step 8: Local Testing with Docker Compose

```bash
# Create .env file
cp .env.example .env
# Update .env with your credentials

# Build and run locally
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Step 9: CI/CD Troubleshooting

### Common Issues

**1. ECR Login Fails**
- Verify AWS credentials in GitHub secrets
- Check AWS account ID is correct
- Ensure ECR repositories exist

**2. ECS Deployment Fails**
- Check ECS service is created
- Verify task definition exists
- Check IAM role permissions
- Review CloudWatch logs

**3. Docker Build Fails**
- Ensure Dockerfile paths are correct
- Check for missing environment variables
- Verify Node.js version compatibility

### Debug Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster mivent-cluster --services mivent-backend-service

# View task logs
aws logs tail /ecs/mivent-backend --follow

# Check task events
aws ecs describe-tasks --cluster mivent-cluster --tasks <task-arn>

# ECR image verification
aws ecr describe-images --repository-name mivent-backend
```

## Step 10: Security Best Practices

1. **Use AWS Secrets Manager** for sensitive data
2. **Enable ECR scanning** for vulnerabilities
3. **Use VPC Security Groups** to restrict access
4. **Enable ECS Container Insights** for monitoring
5. **Rotate AWS credentials** regularly
6. **Use IAM roles** instead of root credentials
7. **Enable CloudTrail** for audit logging
8. **Use HTTPS** with AWS Certificate Manager

## Cost Optimization

- Use **Fargate Spot** for non-critical tasks (50-70% savings)
- **Auto-scale** based on CloudWatch metrics
- Use **Reserved Instances** for predictable workloads
- **Optimize Docker images** to reduce storage costs
- Clean up old ECR images regularly

## Rollback Procedure

If deployment goes wrong:

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster mivent-cluster \
  --service mivent-backend-service \
  --task-definition mivent-backend:1 \
  --force-new-deployment
```

## Next Steps

1. Update the workflow file with your specific AWS resources
2. Configure GitHub secrets
3. Create ECS task definitions
4. Test locally with Docker Compose
5. Push to `develop` branch to test the pipeline
6. Monitor CloudWatch logs during deployment
7. Set up monitoring and alerts

For more information:
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
