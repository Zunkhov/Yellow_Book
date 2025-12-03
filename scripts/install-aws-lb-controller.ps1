# Install AWS Load Balancer Controller on EKS
# This controller will create ALB automatically when we deploy Ingress

$CLUSTER_NAME = "yellowbooks-cluster"
$REGION = "eu-north-1"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

Write-Host "Installing AWS Load Balancer Controller..." -ForegroundColor Green
Write-Host "Account ID: $AWS_ACCOUNT_ID" -ForegroundColor Cyan
Write-Host ""

# Set kubectl context
Write-Host "Updating kubectl context..." -ForegroundColor Cyan
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Add Helm repo
Write-Host "Adding EKS Helm chart repo..." -ForegroundColor Cyan
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Get VPC ID
$VPC_ID = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.resourcesVpcConfig.vpcId" --output text
Write-Host "VPC ID: $VPC_ID" -ForegroundColor Green

# Check if IAM policy already exists
$POLICY_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy"
$POLICY_EXISTS = aws iam get-policy --policy-arn $POLICY_ARN 2>$null

if (-not $POLICY_EXISTS) {
    Write-Host "Creating IAM policy for Load Balancer Controller..." -ForegroundColor Cyan
    
    # Download IAM policy
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.0/docs/install/iam_policy.json" -OutFile "iam_policy.json"
    
    # Create IAM policy
    aws iam create-policy `
        --policy-name AWSLoadBalancerControllerIAMPolicy `
        --policy-document file://iam_policy.json
    
    Remove-Item iam_policy.json
} else {
    Write-Host "IAM policy already exists" -ForegroundColor Yellow
}

# Create IAM service account for Load Balancer Controller
Write-Host "Creating IAM service account..." -ForegroundColor Cyan
eksctl create iamserviceaccount `
    --cluster=$CLUSTER_NAME `
    --namespace=kube-system `
    --name=aws-load-balancer-controller `
    --attach-policy-arn=$POLICY_ARN `
    --override-existing-serviceaccounts `
    --approve `
    --region=$REGION

# Install AWS Load Balancer Controller using Helm
Write-Host "Installing AWS Load Balancer Controller via Helm..." -ForegroundColor Cyan
helm install aws-load-balancer-controller eks/aws-load-balancer-controller `
    -n kube-system `
    --set clusterName=$CLUSTER_NAME `
    --set serviceAccount.create=false `
    --set serviceAccount.name=aws-load-balancer-controller `
    --set region=$REGION `
    --set vpcId=$VPC_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "AWS Load Balancer Controller installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying deployment..." -ForegroundColor Cyan
    kubectl get deployment -n kube-system aws-load-balancer-controller
    
    Write-Host ""
    Write-Host "Controller is ready!" -ForegroundColor Green
    Write-Host "You can now deploy Ingress resources to create ALBs automatically." -ForegroundColor Yellow
} else {
    Write-Host "Failed to install Load Balancer Controller" -ForegroundColor Red
    exit 1
}
