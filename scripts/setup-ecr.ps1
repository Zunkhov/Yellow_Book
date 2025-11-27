# ECR Setup Script for Yellow Book
# Run this in PowerShell

# Set variables
$AWS_REGION = "eu-north-1"
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Account ID: $AWS_ACCOUNT_ID" -ForegroundColor Green
Write-Host "Region: $AWS_REGION" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Create API repository
Write-Host "Creating yellowbooks-api ECR repository..." -ForegroundColor Yellow
aws ecr create-repository `
  --repository-name yellowbooks-api `
  --region $AWS_REGION `
  --image-scanning-configuration scanOnPush=true `
  --encryption-configuration encryptionType=AES256

# Create Web repository
Write-Host "`nCreating yellowbooks-web ECR repository..." -ForegroundColor Yellow
aws ecr create-repository `
  --repository-name yellowbooks-web `
  --region $AWS_REGION `
  --image-scanning-configuration scanOnPush=true `
  --encryption-configuration encryptionType=AES256

# Set lifecycle policy for API repo (keep last 10 images)
Write-Host "`nSetting lifecycle policy for yellowbooks-api..." -ForegroundColor Yellow
$apiLifecyclePolicy = @"
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
"@

$apiLifecyclePolicy | Out-File -FilePath "api-lifecycle-policy.json" -Encoding utf8
aws ecr put-lifecycle-policy `
  --repository-name yellowbooks-api `
  --lifecycle-policy-text file://api-lifecycle-policy.json `
  --region $AWS_REGION

# Set lifecycle policy for Web repo
Write-Host "`nSetting lifecycle policy for yellowbooks-web..." -ForegroundColor Yellow
$apiLifecyclePolicy | Out-File -FilePath "web-lifecycle-policy.json" -Encoding utf8
aws ecr put-lifecycle-policy `
  --repository-name yellowbooks-web `
  --lifecycle-policy-text file://web-lifecycle-policy.json `
  --region $AWS_REGION

# Clean up temp files
Remove-Item -Path "api-lifecycle-policy.json" -ErrorAction SilentlyContinue
Remove-Item -Path "web-lifecycle-policy.json" -ErrorAction SilentlyContinue

# List repositories
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ECR Repositories Created:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
aws ecr describe-repositories --region $AWS_REGION --query 'repositories[*].[repositoryName,repositoryUri]' --output table

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add these to GitHub Secrets:" -ForegroundColor White
Write-Host "   AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID" -ForegroundColor Cyan
Write-Host "   AWS_REGION: $AWS_REGION" -ForegroundColor Cyan
Write-Host "`n2. ECR URIs:" -ForegroundColor White
Write-Host "   API:  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yellowbooks-api" -ForegroundColor Cyan
Write-Host "   Web:  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yellowbooks-web" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
