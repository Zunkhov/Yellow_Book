# 🇸🇪 Yellow Book - AWS Stockholm (eu-north-1) Quick Setup

**Region**: Europe (Stockholm) - eu-north-1  
**Total Time**: ~30-40 минут  
**Monthly Cost**: ~$178 (€165)

---

## 🚀 1. EKS Cluster үүсгэх (15 мин)

```bash
# Set region
export AWS_REGION=eu-north-1

# Create EKS cluster
eksctl create cluster \
  --name yellowbooks-cluster \
  --region eu-north-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Enable OIDC
eksctl utils associate-iam-oidc-provider \
  --cluster yellowbooks-cluster \
  --region eu-north-1 \
  --approve

# Update kubeconfig
aws eks update-kubeconfig \
  --name yellowbooks-cluster \
  --region eu-north-1

# Verify
kubectl get nodes
```

---

## 📦 2. ECR Repositories үүсгэх (2 мин)

```bash
# API repository
aws ecr create-repository \
  --repository-name yellowbooks-api \
  --region eu-north-1

# Web repository
aws ecr create-repository \
  --repository-name yellowbooks-web \
  --region eu-north-1

# Get Account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"
echo "✅ API ECR: ${AWS_ACCOUNT_ID}.dkr.ecr.eu-north-1.amazonaws.com/yellowbooks-api"
echo "✅ Web ECR: ${AWS_ACCOUNT_ID}.dkr.ecr.eu-north-1.amazonaws.com/yellowbooks-web"
```

---

## 🗄️ 3. RDS PostgreSQL үүсгэх (10 мин)

```bash
# Get VPC and Security Groups
export VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region eu-north-1 --query "Vpcs[0].VpcId" --output text)
export EKS_SG=$(aws eks describe-cluster --name yellowbooks-cluster --region eu-north-1 --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --output text)

# Create RDS Security Group
export DB_SG=$(aws ec2 create-security-group \
  --group-name yellowbooks-db-sg \
  --description "YellowBooks RDS Security Group" \
  --vpc-id $VPC_ID \
  --region eu-north-1 \
  --query 'GroupId' \
  --output text)

echo "✅ Database Security Group: $DB_SG"

# Allow EKS to connect to RDS (port 5432)
aws ec2 authorize-security-group-ingress \
  --group-id $DB_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $EKS_SG \
  --region eu-north-1

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier yellowbooks-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username yellowbooks_admin \
  --master-user-password "YellowBook2025Stockholm!" \
  --allocated-storage 20 \
  --vpc-security-group-ids $DB_SG \
  --db-name yellowbooks \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --region eu-north-1

# Wait for RDS to be available (5-10 мин)
echo "⏳ Waiting for RDS... (this takes ~5-10 minutes)"
aws rds wait db-instance-available --db-instance-identifier yellowbooks-db --region eu-north-1

# Get RDS endpoint
export DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yellowbooks-db \
  --region eu-north-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "✅ Database Endpoint: $DB_ENDPOINT"

# Create DATABASE_URL
export DATABASE_URL="postgresql://yellowbooks_admin:YellowBook2025Stockholm!@${DB_ENDPOINT}:5432/yellowbooks"
echo "✅ DATABASE_URL: $DATABASE_URL"

# ⚠️ ВАЖНО: Энэ DATABASE_URL-г GitHub Secrets-т нэмнэ!
```

---

## 🔐 4. GitHub OIDC IAM Role үүсгэх (5 мин)

```bash
# Create OIDC Provider (if not exists)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  2>/dev/null || echo "✅ OIDC Provider already exists"

# Create Trust Policy
cat > github-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
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
          "token.actions.githubusercontent.com:sub": "repo:Zunkhov/Yellow_Book:*"
        }
      }
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name GitHubActionsEKSRole \
  --assume-role-policy-document file://github-trust-policy.json

# Attach managed policies
aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy

# Create EKS access policy
cat > eks-access-policy.json <<EOF
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
      "Resource": "*"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name EKSAccessPolicy \
  --policy-document file://eks-access-policy.json

aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/EKSAccessPolicy

echo "✅ IAM Role ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:role/GitHubActionsEKSRole"
```

---

## 🎛️ 5. AWS Load Balancer Controller суулгах (5 мин)

```bash
# Download IAM policy
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.2/docs/install/iam_policy.json

# Create policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam-policy.json

# Create service account with IRSA
eksctl create iamserviceaccount \
  --cluster=yellowbooks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region eu-north-1 \
  --approve

# Install with Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=yellowbooks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=eu-north-1

# Verify
kubectl get deployment -n kube-system aws-load-balancer-controller
```

---

## 🔑 6. GitHub Secrets тохируулах

GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```bash
# Эдгээр утгуудыг GitHub Secrets-т нэм:

AWS_ACCOUNT_ID
# Value: (echo $AWS_ACCOUNT_ID эсвэл 9736-1419-3123 гэх мэт)

DATABASE_URL
# Value: (echo $DATABASE_URL эсвэл дээрх RDS connection string)

JWT_SECRET
# Value: $(openssl rand -base64 32)

REVALIDATION_SECRET  
# Value: $(openssl rand -base64 32)

# Optional (HTTPS-д хэрэгтэй):
ACM_CERTIFICATE_ID
# Value: (ACM certificate үүсгэсний дараа)
```

### ⚡ Секретүүдийг автоматаар авах:

```bash
echo "Copy these to GitHub Secrets:"
echo ""
echo "AWS_ACCOUNT_ID:"
echo "$AWS_ACCOUNT_ID"
echo ""
echo "DATABASE_URL:"
echo "$DATABASE_URL"
echo ""
echo "JWT_SECRET:"
openssl rand -base64 32
echo ""
echo "REVALIDATION_SECRET:"
openssl rand -base64 32
```

---

## 🚀 7. Deploy хийх!

```bash
# 1. Commit changes
cd C:\Users\User\OneDrive\Documents\Yellow-book\adoptable
git add .
git commit -m "feat: configure AWS Stockholm (eu-north-1) deployment"
git push origin main

# 2. GitHub Actions-г харах
# https://github.com/Zunkhov/Yellow_Book/actions

# 3. Deployment шалгах (5-10 мин хүлээнэ)
kubectl get pods -n yellowbooks
kubectl get svc -n yellowbooks
kubectl get ingress -n yellowbooks

# 4. ALB URL авах
export ALB_URL=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "✅ Application URL: http://$ALB_URL"

# 5. Тест хийх
curl http://$ALB_URL/api/health
curl -I http://$ALB_URL/
```

---

## ✅ Verification Checklist

```bash
# ✅ 1. EKS Cluster ажиллаж байна
kubectl get nodes

# ✅ 2. Pods READY байна
kubectl get pods -n yellowbooks

# ✅ 3. Services exposed
kubectl get svc -n yellowbooks

# ✅ 4. Ingress ALB үүссэн
kubectl describe ingress yellowbooks-ingress -n yellowbooks

# ✅ 5. Database migration амжилттай
kubectl logs -n yellowbooks job/prisma-migration

# ✅ 6. Application accessible
export ALB_URL=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$ALB_URL/
```

---

## 🔍 Troubleshooting

### Pods ImagePullBackOff

```bash
# ECR login шалгах
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.eu-north-1.amazonaws.com

# Image build manually тестлэх
cd C:\Users\User\OneDrive\Documents\Yellow-book\adoptable
docker build -f apps/yb-api/Dockerfile -t test-api .
```

### Ingress ALB үүсэхгүй

```bash
# Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Subnet tags шалгах (ALB-д зориулж)
aws ec2 describe-subnets --region eu-north-1 --filters "Name=vpc-id,Values=$VPC_ID"

# Tags нэмэх (хэрэв дутуу бол):
aws ec2 create-tags --resources <subnet-id> --tags Key=kubernetes.io/role/elb,Value=1
```

### Database connection failed

```bash
# Security group rules шалгах
aws ec2 describe-security-groups --group-ids $DB_SG --region eu-north-1

# Connection test
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql "$DATABASE_URL"
```

---

## 💰 Stockholm Region Cost

**Monthly estimate (EU pricing):**
- EKS Control Plane: **$73** (~€68)
- EC2 t3.medium x2: **$62** (~€58)
- RDS db.t3.micro: **$16** (~€15)
- ALB: **$22** (~€20)
- Data Transfer: **$5** (~€5)
- **Total: ~$178/month (~€165/month)**

**Cost savings:**
- Use Spot instances: -50%
- Turn off during nights/weekends: -40%
- Reserved instances (1 year): -30%

---

## 🗑️ Cleanup (Бүгдийг устгах)

```bash
# 1. Kubernetes resources
kubectl delete namespace yellowbooks

# 2. ALB Controller
helm uninstall aws-load-balancer-controller -n kube-system

# 3. EKS Cluster (10-15 мин)
eksctl delete cluster --name yellowbooks-cluster --region eu-north-1

# 4. RDS Database
aws rds delete-db-instance \
  --db-instance-identifier yellowbooks-db \
  --skip-final-snapshot \
  --region eu-north-1

# 5. ECR Repositories
aws ecr delete-repository --repository-name yellowbooks-api --force --region eu-north-1
aws ecr delete-repository --repository-name yellowbooks-web --force --region eu-north-1

# 6. IAM Resources
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/EKSAccessPolicy
aws iam delete-role --role-name GitHubActionsEKSRole
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/EKSAccessPolicy
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy

# 7. Security Groups
aws ec2 delete-security-group --group-id $DB_SG --region eu-north-1

# 8. Load Balancers шалгах (manually cleaned by K8s)
aws elbv2 describe-load-balancers --region eu-north-1
```

---

## 📊 Setup Progress

- [x] AWS Account ready (Stockholm region)
- [ ] EKS Cluster created
- [ ] ECR Repositories created
- [ ] RDS Database created
- [ ] GitHub OIDC IAM Role created
- [ ] AWS Load Balancer Controller installed
- [ ] GitHub Secrets configured
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow passed
- [ ] Application accessible via ALB

---

## 🎯 Next Steps After Deploy

1. **Custom Domain + HTTPS**:
   - Route 53 Hosted Zone үүсгэх
   - ACM Certificate request хийх (eu-north-1)
   - DNS validation
   - Ingress-д certificate ARN нэмэх

2. **Monitoring**:
   - CloudWatch Container Insights
   - Prometheus + Grafana
   - X-Ray for tracing

3. **CI/CD Improvements**:
   - Dev/Staging environments
   - Blue-Green deployments
   - Automated testing

4. **Security**:
   - Network Policies
   - Pod Security Standards
   - Secrets Manager
   - KMS encryption

5. **Performance**:
   - CDN (CloudFront)
   - Caching (ElastiCache)
   - Read replicas (RDS)

---

## 🆘 Support

- **AWS Stockholm Support**: https://aws.amazon.com/contact-us/
- **EKS Documentation**: https://docs.aws.amazon.com/eks/
- **eksctl**: https://eksctl.io/
- **Kubernetes**: https://kubernetes.io/docs/

**Repository**: https://github.com/Zunkhov/Yellow_Book

---

**🇸🇪 Stockholm Setup Complete! Deploy хийхэд бэлэн байна! 🚀**
