#!/bin/bash

# AWS Deployment Helper Script
# This script helps set up AWS infrastructure and GitHub secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== MIVENT AWS Deployment Setup ===${NC}\n"

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not installed${NC}"
        echo "Install from: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed${NC}"
        echo "Install from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}\n"
}

# Get AWS information
get_aws_info() {
    echo -e "${YELLOW}AWS Configuration${NC}"
    read -p "Enter your AWS region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    read -p "Enter your AWS Account ID: " AWS_ACCOUNT_ID
    
    if [[ ! $AWS_ACCOUNT_ID =~ ^[0-9]{12}$ ]]; then
        echo -e "${RED}❌ Invalid AWS Account ID${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ AWS configured${NC}\n"
}

# Create ECR repositories
create_ecr_repos() {
    echo -e "${YELLOW}Creating ECR Repositories...${NC}"
    
    aws ecr create-repository \
        --repository-name mivent-backend \
        --region $AWS_REGION \
        2>/dev/null || echo "Backend repository already exists"
    
    aws ecr create-repository \
        --repository-name mivent-frontend \
        --region $AWS_REGION \
        2>/dev/null || echo "Frontend repository already exists"
    
    echo -e "${GREEN}✅ ECR repositories ready${NC}\n"
}

# Create ECS cluster
create_ecs_cluster() {
    echo -e "${YELLOW}Creating ECS Cluster...${NC}"
    
    aws ecs create-cluster \
        --cluster-name mivent-cluster \
        --region $AWS_REGION \
        2>/dev/null || echo "Cluster already exists"
    
    echo -e "${GREEN}✅ ECS cluster ready${NC}\n"
}

# Create CloudWatch Log Groups
create_log_groups() {
    echo -e "${YELLOW}Creating CloudWatch Log Groups...${NC}"
    
    aws logs create-log-group \
        --log-group-name /ecs/mivent-backend \
        --region $AWS_REGION \
        2>/dev/null || echo "Backend log group already exists"
    
    aws logs create-log-group \
        --log-group-name /ecs/mivent-frontend \
        --region $AWS_REGION \
        2>/dev/null || echo "Frontend log group already exists"
    
    aws logs put-retention-policy \
        --log-group-name /ecs/mivent-backend \
        --retention-in-days 30 \
        --region $AWS_REGION
    
    aws logs put-retention-policy \
        --log-group-name /ecs/mivent-frontend \
        --retention-in-days 30 \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Log groups created${NC}\n"
}

# Display GitHub secrets instructions
display_github_secrets() {
    echo -e "${YELLOW}GitHub Secrets Configuration${NC}"
    echo "Add these secrets to your GitHub repository:"
    echo "Settings → Secrets and variables → Actions → New repository secret"
    echo ""
    echo "AWS Credentials:"
    echo "  - AWS_ACCESS_KEY_ID"
    echo "  - AWS_SECRET_ACCESS_KEY"
    echo "  - AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
    echo "  - ECS_CLUSTER_NAME: mivent-cluster"
    echo ""
    echo "Backend Environment Variables:"
    echo "  - MONGODB_URI: <your-mongodb-uri>"
    echo "  - JWT_SECRET: <your-jwt-secret>"
    echo "  - CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    echo "  - EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD"
    echo ""
    echo "Frontend Environment Variables:"
    echo "  - REACT_APP_API_URL: https://api.mivent.com"
    echo "  - REACT_APP_FIREBASE_* (all Firebase configuration)"
    echo ""
    echo "Optional:"
    echo "  - SLACK_WEBHOOK: <your-slack-webhook-url>"
    echo ""
}

# Test Docker build
test_docker_build() {
    read -p "Test Docker build locally? (y/n) [n]: " TEST_BUILD
    TEST_BUILD=${TEST_BUILD:-n}
    
    if [[ $TEST_BUILD == "y" ]]; then
        echo -e "${YELLOW}Building Docker images...${NC}"
        
        if docker build -f backend/Dockerfile.prod -t mivent-backend:test . ; then
            echo -e "${GREEN}✅ Backend build successful${NC}"
        else
            echo -e "${RED}❌ Backend build failed${NC}"
        fi
        
        if docker build -f frontend/Dockerfile.prod -t mivent-frontend:test . ; then
            echo -e "${GREEN}✅ Frontend build successful${NC}"
        else
            echo -e "${RED}❌ Frontend build failed${NC}"
        fi
    fi
}

# Main execution
main() {
    check_prerequisites
    get_aws_info
    create_ecr_repos
    create_ecs_cluster
    create_log_groups
    test_docker_build
    display_github_secrets
    
    echo -e "${GREEN}=== Setup Complete ===${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub secrets (see above)"
    echo "2. Create ECS task definitions (see AWS_DEPLOYMENT_SETUP.md)"
    echo "3. Create ECS services"
    echo "4. Push to GitHub to trigger the pipeline"
    echo ""
}

main
