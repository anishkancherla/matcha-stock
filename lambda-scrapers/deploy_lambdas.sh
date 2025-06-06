#!/bin/bash

# AWS Lambda Deployment Script for Matcha Stock Scrapers

echo "🚀 Deploying Matcha Stock Scrapers to AWS Lambda..."

# Configuration
REGION="us-east-1"  # Change to your preferred region
ROLE_NAME="matcha-lambda-role"
FUNCTION_PREFIX="matcha-stock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo_error "AWS CLI is not installed. Please install it first:"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo_warning "jq is not installed. Installing it will help with JSON parsing."
fi

echo "📋 Prerequisites checklist:"
echo "1. AWS CLI configured with credentials? (aws configure)"
echo "2. Have your DATABASE_URL ready?"
echo "3. Have your RESEND_API_KEY ready?"
echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Get environment variables
read -p "Enter your DATABASE_URL: " DATABASE_URL
read -p "Enter your RESEND_API_KEY: " RESEND_API_KEY

echo ""
echo "🔧 Setting up deployment environment..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Copy scrapers
echo "📁 Copying scraper files..."
cp ../matcha-stock/scrapers/*.py .
cp ../lambda-scrapers/*.py .
cp ../lambda-scrapers/requirements.txt .

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt -t .

# Create IAM role if it doesn't exist
echo "🔐 Setting up IAM role..."
aws iam get-role --role-name $ROLE_NAME &> /dev/null
if [ $? -ne 0 ]; then
    echo "Creating IAM role..."
    
    # Trust policy for Lambda
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json

    # Attach basic execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    echo_success "IAM role created"
else
    echo_success "IAM role already exists"
fi

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"

# Deploy Lambda functions
deploy_lambda() {
    local function_name=$1
    local handler=$2
    local description=$3
    
    echo "🚀 Deploying $function_name..."
    
    # Create deployment package
    zip -r ${function_name}.zip . -x "*.sh" "*.json" "deployment/*"
    
    # Check if function exists
    aws lambda get-function --function-name $function_name &> /dev/null
    if [ $? -eq 0 ]; then
        # Update existing function
        aws lambda update-function-code \
            --function-name $function_name \
            --zip-file fileb://${function_name}.zip
            
        aws lambda update-function-configuration \
            --function-name $function_name \
            --handler $handler \
            --runtime python3.11 \
            --timeout 300 \
            --memory-size 512 \
            --environment Variables="{DATABASE_URL=$DATABASE_URL,RESEND_API_KEY=$RESEND_API_KEY}"
    else
        # Create new function
        aws lambda create-function \
            --function-name $function_name \
            --runtime python3.11 \
            --role $ROLE_ARN \
            --handler $handler \
            --zip-file fileb://${function_name}.zip \
            --timeout 300 \
            --memory-size 512 \
            --description "$description" \
            --environment Variables="{DATABASE_URL=$DATABASE_URL,RESEND_API_KEY=$RESEND_API_KEY}"
    fi
    
    if [ $? -eq 0 ]; then
        echo_success "$function_name deployed successfully"
        
        # Create CloudWatch schedule (every 5 minutes)
        aws events put-rule \
            --name "${function_name}-schedule" \
            --schedule-expression "rate(5 minutes)" \
            --description "Run $function_name every 5 minutes"
            
        # Add permission for CloudWatch to invoke Lambda
        aws lambda add-permission \
            --function-name $function_name \
            --statement-id "${function_name}-cloudwatch" \
            --action lambda:InvokeFunction \
            --principal events.amazonaws.com \
            --source-arn "arn:aws:events:$REGION:$(aws sts get-caller-identity --query Account --output text):rule/${function_name}-schedule" \
            &> /dev/null
            
        # Add target to the rule
        aws events put-targets \
            --rule "${function_name}-schedule" \
            --targets "Id=1,Arn=arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$function_name"
            
        echo_success "CloudWatch schedule created for $function_name"
    else
        echo_error "Failed to deploy $function_name"
    fi
}

# Deploy individual scrapers
deploy_lambda "${FUNCTION_PREFIX}-matchajp" "lambda_matchajp.lambda_handler" "MatchaJP scraper for matcha stock monitoring"

echo ""
echo_success "🎉 Deployment completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check AWS Lambda console to verify functions are deployed"
echo "2. Check CloudWatch logs for execution logs"
echo "3. Monitor CloudWatch Events for scheduled executions"
echo "4. Test functions manually in AWS console"
echo ""
echo "🔗 Useful links:"
echo "- Lambda Console: https://console.aws.amazon.com/lambda/"
echo "- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home#logsV2:"
echo "- EventBridge Rules: https://console.aws.amazon.com/events/"

# Cleanup
cd ..
rm -rf deployment 