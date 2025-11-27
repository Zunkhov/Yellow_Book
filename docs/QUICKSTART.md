# 🚀 Yellow Book - AWS EKS Deployment Quick Start

Энэ гарын авлага нь Yellow Book аппликэйшнийг AWS EKS дээр deploy хийх хурдан алхмуудыг харуулна.

---

## 📋 Prerequisites

- AWS Account (billing enabled)
- AWS CLI installed & configured
- kubectl installed
- eksctl installed
- Helm installed (v3+)
- Docker installed
- GitHub account with admin access to repository

---

## ⚡ Quick Deploy (30 минут)

### Step 1: AWS EKS Cluster үүсгэх (15 мин)

```bash
# 1. EKS Cluster үүсгэх
eksctl create cluster \
  --name yellowbooks-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# 2. OIDC Provider холбох
eksctl utils associate-iam-oidc-provider \
  --cluster yellowbooks-cluster \
  --region us-east-1 \
  --approve

# 3. kubeconfig шинэчлэх
aws eks update-kubeconfig \
  --name yellowbooks-cluster \
  --region us-east-1

# 4. Cluster шалгах
kubectl get nodes
```

### Step 2: ECR Repositories үүсгэх (2 мин)

```bash
# API repository
aws ecr create-repository \
  --repository-name yellowbooks-api \
  --region us-east-1

# Web repository
aws ecr create-repository \
  --repository-name yellowbooks-web \
  --region us-east-1

# Account ID авах
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your AWS Account ID: $AWS_ACCOUNT_ID"
```

### Step 3: RDS Database үүсгэх (5 мин)

```bash
# 1. Default VPC-ийн Security Group авах
export VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
export EKS_SG=$(aws eks describe-cluster --name yellowbooks-cluster --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --output text)

# 2. RDS Security Group үүсгэх
export DB_SG=$(aws ec2 create-security-group \
  --group-name yellowbooks-db-sg \
  --description "YellowBooks RDS Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

# 3. EKS-ээс RDS руу 5432 port нээх
aws ec2 authorize-security-group-ingress \
  --group-id $DB_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $EKS_SG

# 4. RDS Database үүсгэх
aws rds create-db-instance \
  --db-instance-identifier yellowbooks-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username yellowbooks_admin \
  --master-user-password "YourSecurePassword123!" \
  --allocated-storage 20 \
  --vpc-security-group-ids $DB_SG \
  --db-name yellowbooks \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --region us-east-1

# 5. RDS endpoint авах (5 мин хүлээнэ)
echo "Waiting for RDS to be available..."
aws rds wait db-instance-available --db-instance-identifier yellowbooks-db

export DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier yellowbooks-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "Database endpoint: $DB_ENDPOINT"

# 6. DATABASE_URL үүсгэх
export DATABASE_URL="postgresql://yellowbooks_admin:YourSecurePassword123!@${DB_ENDPOINT}:5432/yellowbooks"
echo "DATABASE_URL: $DATABASE_URL"
```

### Step 4: AWS Load Balancer Controller суулгах (5 мин)

```bash
# 1. IAM Policy download
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.2/docs/install/iam_policy.json

# 2. Policy үүсгэх
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam-policy.json

# 3. Service Account үүсгэх
eksctl create iamserviceaccount \
  --cluster=yellowbooks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve

# 4. Helm repo нэмэх
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# 5. Controller суулгах
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=yellowbooks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# 6. Шалгах
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### Step 5: GitHub OIDC IAM Role үүсгэх (3 мин)

```bash
# 1. Trust Policy үүсгэх
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

# 2. OIDC Provider үүсгэх (хэрэв байхгүй бол)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  2>/dev/null || echo "OIDC provider already exists"

# 3. IAM Role үүсгэх
aws iam create-role \
  --role-name GitHubActionsEKSRole \
  --assume-role-policy-document file://github-trust-policy.json

# 4. Permissions хавсаргах
aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy

# 5. EKS access policy үүсгэх
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

### Step 6: GitHub Secrets тохируулах

GitHub Repository → Settings → Secrets and variables → Actions:

```bash
# Copy хийгээд GitHub Secrets-т нэмнэ
echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "DATABASE_URL: $DATABASE_URL"

# Шинэ секретүүд:
JWT_SECRET: $(openssl rand -base64 32)
REVALIDATION_SECRET: $(openssl rand -base64 32)
ACM_CERTIFICATE_ID: <certificate ID after creating ACM cert>
```

**Required Secrets:**
- `AWS_ACCOUNT_ID`: AWS Account ID
- `DATABASE_URL`: RDS connection string
- `JWT_SECRET`: Random 32+ char string
- `REVALIDATION_SECRET`: Random 32+ char string
- `ACM_CERTIFICATE_ID`: (Skip for now, HTTP-ээр тестлэе)

### Step 7: Deploy хийх (2 мин)

```bash
# 1. Code push to main branch
git add .
git commit -m "feat: add EKS deployment configuration"
git push origin main

# 2. GitHub Actions workflow ажиллах хүртэл хүлээх
# https://github.com/Zunkhov/Yellow_Book/actions

# 3. Deployment status шалгах
kubectl get pods -n yellowbooks
kubectl get svc -n yellowbooks
kubectl get ingress -n yellowbooks

# 4. Load Balancer URL авах
export ALB_URL=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$ALB_URL"

# 5. Тест хийх
curl http://$ALB_URL/api/health
curl http://$ALB_URL/
```

---

## 🔒 HTTPS Setup (Optional, +10 мин)

### Step 1: ACM Certificate үүсгэх

```bash
# 1. Certificate request
aws acm request-certificate \
  --domain-name yellowbook.mn \
  --subject-alternative-names www.yellowbook.mn api.yellowbook.mn \
  --validation-method DNS \
  --region us-east-1

# 2. Certificate ARN авах
export CERT_ARN=$(aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[0].CertificateArn' --output text)
echo "Certificate ARN: $CERT_ARN"

# 3. Validation records авах
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

### Step 2: Route 53 DNS Validation

```bash
# Hosted Zone ID авах (байгаа бол)
export HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name yellowbook.mn --query 'HostedZones[0].Id' --output text)

# CNAME records нэмэх (validation-д)
# ACM Console-оос CNAME name/value авч Route 53-т нэм
```

### Step 3: GitHub Secret нэмэх

```bash
# Certificate ID-г секрет болгох
echo "ACM_CERTIFICATE_ID: ${CERT_ARN##*/}"
```

GitHub → Settings → Secrets → `ACM_CERTIFICATE_ID` нэм

### Step 4: Re-deploy

```bash
git commit --allow-empty -m "chore: trigger redeploy with HTTPS"
git push origin main
```

---

## ✅ Verification Checklist

```bash
# 1. Cluster ажиллаж байна
kubectl get nodes

# 2. Pods healthy байна
kubectl get pods -n yellowbooks
kubectl logs -n yellowbooks deployment/yb-api
kubectl logs -n yellowbooks deployment/yb-web

# 3. Services exposed байна
kubectl get svc -n yellowbooks

# 4. Ingress ALB үүссэн
kubectl get ingress -n yellowbooks
kubectl describe ingress yellowbooks-ingress -n yellowbooks

# 5. ALB Target health
export ALB_ARN=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(DNSName, '$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath="{.status.loadBalancer.ingress[0].hostname}")')].LoadBalancerArn" --output text)
aws elbv2 describe-target-health --target-group-arn $(aws elbv2 describe-target-groups --load-balancer-arn $ALB_ARN --query 'TargetGroups[0].TargetGroupArn' --output text)

# 6. Application accessible
export ALB_URL=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -I http://$ALB_URL/api/health
curl -I http://$ALB_URL/

# 7. Database migration completed
kubectl logs -n yellowbooks job/prisma-migration
```

---

## 🐛 Troubleshooting

### Pods CrashLoopBackOff

```bash
# Logs харах
kubectl logs -n yellowbooks <pod-name>

# Events шалгах
kubectl describe pod -n yellowbooks <pod-name>

# Common issues:
# - DATABASE_URL буруу → Secret шалгах
# - Migration амжилтгүй → Job logs харах
# - Port conflicts → Service config шалгах
```

### Ingress ALB үүсэхгүй

```bash
# Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Ingress annotations шалгах
kubectl describe ingress -n yellowbooks yellowbooks-ingress

# Subnet tags шалгах (ELB ашиглах)
aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID"
```

### Database холбогдохгүй

```bash
# Security group rules шалгах
aws ec2 describe-security-groups --group-ids $DB_SG

# EKS-ээс RDS руу connectivity test
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql $DATABASE_URL
```

---

## 💰 Cost Breakdown

| Resource | Monthly Cost |
|----------|-------------|
| EKS Cluster | $73 |
| EC2 t3.medium x2 | $60 |
| RDS db.t3.micro | $15 |
| ALB | $20 |
| Data Transfer | $10 |
| **Total** | **~$178** |

**Optimization tips:**
- Spot instances ашиглах (50% хямд)
- Цагаараа унтраах (dev environment)
- Reserved instances (1-3 year)

---

## 🗑️ Cleanup (Full Teardown)

```bash
# 1. Namespace устгах (ALB автоматаар устана)
kubectl delete namespace yellowbooks

# 2. Load Balancer Controller устгах
helm uninstall aws-load-balancer-controller -n kube-system

# 3. EKS Cluster устгах (10 мин)
eksctl delete cluster --name yellowbooks-cluster --region us-east-1

# 4. RDS устгах
aws rds delete-db-instance \
  --db-instance-identifier yellowbooks-db \
  --skip-final-snapshot

# 5. ECR repositories устгах
aws ecr delete-repository --repository-name yellowbooks-api --force --region us-east-1
aws ecr delete-repository --repository-name yellowbooks-web --force --region us-east-1

# 6. IAM resources устгах
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
aws iam detach-role-policy --role-name GitHubActionsEKSRole --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/EKSAccessPolicy
aws iam delete-role --role-name GitHubActionsEKSRole
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/EKSAccessPolicy
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy

# 7. Security groups устгах
aws ec2 delete-security-group --group-id $DB_SG

# 8. ALB manually шалгах ба устгах
aws elbv2 describe-load-balancers --region us-east-1
# Хэрэв load balancer үлдсэн бол:
# aws elbv2 delete-load-balancer --load-balancer-arn <ARN>
```

---

## 📚 Next Steps

1. **Custom Domain**: Route 53 + ACM тохируулах
2. **Monitoring**: CloudWatch Container Insights, Prometheus/Grafana
3. **CI/CD**: Multi-environment (dev/staging/prod)
4. **Security**: Network Policies, Pod Security Standards
5. **Backups**: RDS automated backups, Velero for cluster
6. **Scaling**: Cluster Autoscaler, Karpenter

---

## 🆘 Need Help?

- **AWS Docs**: https://docs.aws.amazon.com/eks/
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **eksctl**: https://eksctl.io/
- **AWS Load Balancer Controller**: https://kubernetes-sigs.github.io/aws-load-balancer-controller/

**Repository**: https://github.com/Zunkhov/Yellow_Book

---

**Total Setup Time**: ~30-40 минут  
**Difficulty**: Intermediate  
**Cost**: ~$178/month (optimizable)

🎉 **Done! Your Yellow Book app is now running on AWS EKS!**
