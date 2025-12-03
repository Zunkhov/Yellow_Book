# Create EKS Cluster for Yellow Book Application
# This will take 15-20 minutes to complete

$CLUSTER_NAME = "yellowbooks-cluster"
$REGION = "eu-north-1"
$K8S_VERSION = "1.31"
$NODE_TYPE = "t3.medium"
$NODES_MIN = 2
$NODES_MAX = 3
$NODES_DESIRED = 2

Write-Host "Creating EKS cluster: $CLUSTER_NAME in $REGION" -ForegroundColor Green
Write-Host "This will take approximately 15-20 minutes..." -ForegroundColor Yellow
Write-Host ""

# Create cluster with eksctl
eksctl create cluster `
  --name $CLUSTER_NAME `
  --region $REGION `
  --version $K8S_VERSION `
  --nodegroup-name standard-workers `
  --node-type $NODE_TYPE `
  --nodes $NODES_DESIRED `
  --nodes-min $NODES_MIN `
  --nodes-max $NODES_MAX `
  --with-oidc `
  --managed `
  --alb-ingress-access `
  --full-ecr-access

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Cluster created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying cluster access..." -ForegroundColor Cyan
    kubectl get nodes
    
    Write-Host ""
    Write-Host "Getting OIDC provider URL..." -ForegroundColor Cyan
    $OIDC_PROVIDER = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.identity.oidc.issuer" --output text
    Write-Host "OIDC Provider: $OIDC_PROVIDER" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Create RDS PostgreSQL database" -ForegroundColor White
    Write-Host "2. Set up IAM roles for GitHub Actions OIDC" -ForegroundColor White
    Write-Host "3. Install AWS Load Balancer Controller" -ForegroundColor White
    Write-Host "4. Install cert-manager for TLS" -ForegroundColor White
} else {
    Write-Host "Failed to create cluster" -ForegroundColor Red
    exit 1
}
