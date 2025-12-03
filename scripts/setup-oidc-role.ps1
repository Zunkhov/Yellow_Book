# Create IAM OIDC Role for GitHub Actions to deploy to EKS

$CLUSTER_NAME = "yellowbooks-cluster"
$REGION = "eu-north-1"
$GITHUB_ORG = "Zunkhov"
$GITHUB_REPO = "Yellow_Book"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

Write-Host "Creating OIDC IAM Role for GitHub Actions..." -ForegroundColor Green
Write-Host "AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Cyan
Write-Host "GitHub Repo: $GITHUB_ORG/$GITHUB_REPO" -ForegroundColor Cyan
Write-Host ""

# Get OIDC provider URL from EKS cluster
$OIDC_PROVIDER_URL = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.identity.oidc.issuer" --output text
$OIDC_PROVIDER_ID = $OIDC_PROVIDER_URL -replace 'https://', ''

Write-Host "OIDC Provider URL: $OIDC_PROVIDER_URL" -ForegroundColor Green
Write-Host "OIDC Provider ID: $OIDC_PROVIDER_ID" -ForegroundColor Green

# Create trust policy for GitHub Actions
$TRUST_POLICY = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER_ID}:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "${OIDC_PROVIDER_ID}:sub": "system:serviceaccount:*"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
"@

# Save trust policy to file
$TRUST_POLICY | Out-File -FilePath "trust-policy.json" -Encoding utf8

# Create IAM role
Write-Host "Creating IAM role..." -ForegroundColor Cyan
$ROLE_ARN = aws iam create-role `
    --role-name GitHubActions-EKS-Deploy `
    --assume-role-policy-document file://trust-policy.json `
    --description "Role for GitHub Actions to deploy to EKS" `
    --query "Role.Arn" `
    --output text

if ($LASTEXITCODE -ne 0) {
    Write-Host "Role might already exist, getting existing role..." -ForegroundColor Yellow
    $ROLE_ARN = aws iam get-role --role-name GitHubActions-EKS-Deploy --query "Role.Arn" --output text
}

Write-Host "Role ARN: $ROLE_ARN" -ForegroundColor Green

# Create policy for EKS and ECR access
$POLICY_DOC = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:DescribeNodegroup",
        "eks:ListNodegroups"
      ],
      "Resource": "arn:aws:eks:${REGION}:${AWS_ACCOUNT_ID}:cluster/${CLUSTER_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
"@

$POLICY_DOC | Out-File -FilePath "eks-deploy-policy.json" -Encoding utf8

# Create or update policy
$POLICY_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/GitHubActions-EKS-DeployPolicy"
$POLICY_EXISTS = aws iam get-policy --policy-arn $POLICY_ARN 2>$null

if (-not $POLICY_EXISTS) {
    Write-Host "Creating IAM policy..." -ForegroundColor Cyan
    $POLICY_ARN = aws iam create-policy `
        --policy-name GitHubActions-EKS-DeployPolicy `
        --policy-document file://eks-deploy-policy.json `
        --description "Policy for GitHub Actions to deploy to EKS" `
        --query "Policy.Arn" `
        --output text
} else {
    Write-Host "Policy already exists" -ForegroundColor Yellow
}

Write-Host "Policy ARN: $POLICY_ARN" -ForegroundColor Green

# Attach policy to role
Write-Host "Attaching policy to role..." -ForegroundColor Cyan
aws iam attach-role-policy `
    --role-name GitHubActions-EKS-Deploy `
    --policy-arn $POLICY_ARN

# Update aws-auth ConfigMap to allow the role to access EKS
Write-Host "Updating aws-auth ConfigMap..." -ForegroundColor Cyan

$AWS_AUTH_PATCH = @"
mapRoles: |
  - rolearn: $ROLE_ARN
    username: github-actions
    groups:
      - system:masters
"@

# Get current aws-auth ConfigMap
kubectl get configmap aws-auth -n kube-system -o yaml > aws-auth.yaml

Write-Host "Please manually add this to aws-auth ConfigMap:" -ForegroundColor Yellow
Write-Host $AWS_AUTH_PATCH -ForegroundColor Cyan

# Clean up
Remove-Item trust-policy.json, eks-deploy-policy.json -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "OIDC setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Add this to GitHub Secrets:" -ForegroundColor Yellow
Write-Host "AWS_ROLE_ARN=$ROLE_ARN" -ForegroundColor Cyan
Write-Host ""
Write-Host "The role has been granted 'system:masters' access to the cluster." -ForegroundColor Yellow
