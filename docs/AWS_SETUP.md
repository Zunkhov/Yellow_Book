# AWS EKS Deployment Setup Guide

## 1️⃣ AWS IAM OIDC Provider үүсгэх

### Step 1: OIDC Provider үүсгэх

```bash
# EKS cluster-д OIDC provider холбох
eksctl utils associate-iam-oidc-provider \
  --cluster yellowbooks-cluster \
  --region us-east-1 \
  --approve

# Эсвэл AWS Console-оөр:
# 1. IAM → Identity Providers → Add provider
# 2. Provider type: OpenID Connect
# 3. Provider URL: token.actions.githubusercontent.com
# 4. Audience: sts.amazonaws.com
```

### Step 2: GitHub Actions-д зориулсан IAM Role үүсгэх

**Trust Policy** (`github-actions-trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
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
```

**Permissions Policy** (`github-actions-permissions.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "arn:aws:eks:us-east-1:YOUR_ACCOUNT_ID:cluster/yellowbooks-cluster"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}
```

### Step 3: IAM Role үүсгэх

```bash
# 1. Trust policy файл үүсгэх
cat > github-actions-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):oidc-provider/token.actions.githubusercontent.com"
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

# 2. IAM Role үүсгэх
aws iam create-role \
  --role-name GitHubActionsEKSRole \
  --assume-role-policy-document file://github-actions-trust-policy.json

# 3. Permissions policy хавсаргах
aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name GitHubActionsEKSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy

# 4. EKS access policy үүсгэх
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
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/EKSAccessPolicy
```

### Step 4: GitHub Secrets тохируулах

GitHub Repository → Settings → Secrets and variables → Actions → New repository secret:

```
AWS_ACCOUNT_ID: 123456789012
AWS_REGION: us-east-1
EKS_CLUSTER_NAME: yellowbooks-cluster
DATABASE_URL: postgresql://user:pass@host:5432/yellowbooks
JWT_SECRET: your-super-secret-jwt-key-here-at-least-32-chars
REVALIDATION_SECRET: your-revalidation-secret-key
```

---

## 2️⃣ EKS Cluster үүсгэх

### Option 1: eksctl ашиглах (Recommended)

```bash
eksctl create cluster \
  --name yellowbooks-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# OIDC холбох
eksctl utils associate-iam-oidc-provider \
  --cluster yellowbooks-cluster \
  --region us-east-1 \
  --approve
```

### Option 2: AWS Console

1. EKS → Clusters → Create cluster
2. Cluster name: `yellowbooks-cluster`
3. Kubernetes version: 1.28 (latest stable)
4. Cluster service role: Create new role
5. VPC: Default VPC
6. Security groups: Default
7. Add node group:
   - Name: `standard-workers`
   - AMI type: Amazon Linux 2
   - Instance type: t3.medium
   - Desired size: 2
   - Min size: 1
   - Max size: 4

---

## 3️⃣ AWS Load Balancer Controller суулгах

### Step 1: IRSA (IAM Roles for Service Accounts) үүсгэх

```bash
# 1. IAM policy download
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.2/docs/install/iam_policy.json

# 2. Policy үүсгэх
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam-policy.json

# 3. Service account үүсгэх
eksctl create iamserviceaccount \
  --cluster=yellowbooks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

### Step 2: Helm-ээр controller суулгах

```bash
# Helm repo нэмэх
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=yellowbooks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Шалгах
kubectl get deployment -n kube-system aws-load-balancer-controller
```

---

## 4️⃣ ECR Repository үүсгэх

```bash
# API repository
aws ecr create-repository \
  --repository-name yellowbooks-api \
  --region us-east-1

# Web repository
aws ecr create-repository \
  --repository-name yellowbooks-web \
  --region us-east-1

# Repositories шалгах
aws ecr describe-repositories --region us-east-1
```

---

## 5️⃣ RDS Database үүсгэх

```bash
# Security group үүсгэх
aws ec2 create-security-group \
  --group-name yellowbooks-db-sg \
  --description "Security group for YellowBooks RDS" \
  --vpc-id vpc-xxxxx

# Port 5432 нээх (EKS nodes-оос)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-xxxxx  # EKS node security group

# RDS instance үүсгэх
aws rds create-db-instance \
  --db-instance-identifier yellowbooks-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username yellowbooks_admin \
  --master-user-password CHANGE_THIS_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name yellowbooks \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --region us-east-1

# Connection string авах
aws rds describe-db-instances \
  --db-instance-identifier yellowbooks-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

DATABASE_URL format:
```
postgresql://yellowbooks_admin:PASSWORD@yellowbooks-db.xxxxx.us-east-1.rds.amazonaws.com:5432/yellowbooks
```

---

## 6️⃣ HTTPS & DNS Тохиргоо

### Step 1: ACM Certificate үүсгэх

```bash
# Certificate request
aws acm request-certificate \
  --domain-name yellowbook.mn \
  --subject-alternative-names www.yellowbook.mn api.yellowbook.mn \
  --validation-method DNS \
  --region us-east-1

# Certificate ARN авах
aws acm list-certificates --region us-east-1
```

### Step 2: Route 53 Hosted Zone

```bash
# Hosted zone үүсгэх (эсвэл байгаа бол skip)
aws route53 create-hosted-zone \
  --name yellowbook.mn \
  --caller-reference $(date +%s)

# NS records-г domain registrar дээр тохируулах
```

### Step 3: DNS Validation

ACM console дээр certificate-ийн validation CNAME records-г Route 53-т нэмэх.

### Step 4: Ingress-д Certificate ARN нэмэх

`k8s/base/ingress.yaml` дотор:
```yaml
metadata:
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx
```

---

## 7️⃣ kubectl тохируулах

```bash
# kubeconfig шинэчлэх
aws eks update-kubeconfig \
  --name yellowbooks-cluster \
  --region us-east-1

# Шалгах
kubectl get nodes
kubectl get namespaces
```

---

## 8️⃣ Deployment тестлэх

### Local тест (Docker)

```bash
cd adoptable

# API build
docker build -f apps/yb-api/Dockerfile -t yb-api:test .

# Web build
docker build -f apps/adoptable/Dockerfile -t yb-web:test .

# Test run
docker run -p 3333:3333 yb-api:test
docker run -p 3000:3000 yb-web:test
```

### Manual Kubernetes Deploy

```bash
# Namespace үүсгэх
kubectl apply -f k8s/base/namespace.yaml

# Secrets үүсгэх (manual)
kubectl create secret generic yellowbooks-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=JWT_SECRET="your-secret" \
  --namespace=yellowbooks

# ConfigMap
kubectl apply -f k8s/base/configmap.yaml

# Deployments
kubectl apply -f k8s/base/api-deployment.yaml
kubectl apply -f k8s/base/api-service.yaml
kubectl apply -f k8s/base/web-deployment.yaml
kubectl apply -f k8s/base/web-service.yaml

# Ingress
kubectl apply -f k8s/base/ingress.yaml

# HPA
kubectl apply -f k8s/base/hpa.yaml

# Migration Job
kubectl apply -f k8s/base/migration-job.yaml

# Шалгах
kubectl get all -n yellowbooks
kubectl logs -n yellowbooks deployment/yb-api
kubectl logs -n yellowbooks deployment/yb-web
```

---

## 9️⃣ Troubleshooting

### Pods starting болохгүй байвал

```bash
# Pod logs харах
kubectl logs -n yellowbooks <pod-name>

# Pod events харах
kubectl describe pod -n yellowbooks <pod-name>

# Common issues:
# - ImagePullBackOff: ECR authentication
# - CrashLoopBackOff: Application error
# - Pending: Resources unavailable
```

### Ingress ALB үүсэхгүй байвал

```bash
# Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Ingress status
kubectl describe ingress -n yellowbooks yellowbooks-ingress

# Common issues:
# - Service account permissions
# - Subnet tags missing
# - Security groups
```

### Database холбогдохгүй байвал

```bash
# Security group шалгах
aws ec2 describe-security-groups --group-ids sg-xxxxx

# EKS node-оос RDS руу port нээлттэй эсэхийг шалгах
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql postgresql://user:pass@host:5432/yellowbooks

# Connection string шалгах
kubectl get secret yellowbooks-secrets -n yellowbooks -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

---

## 🔟 Cleanup (Зардал хэмнэх)

```bash
# 1. Kubernetes resources устгах
kubectl delete namespace yellowbooks

# 2. ALB Controller устгах
helm uninstall aws-load-balancer-controller -n kube-system

# 3. EKS Cluster устгах
eksctl delete cluster --name yellowbooks-cluster --region us-east-1

# 4. RDS устгах
aws rds delete-db-instance \
  --db-instance-identifier yellowbooks-db \
  --skip-final-snapshot

# 5. ECR repositories устгах
aws ecr delete-repository --repository-name yellowbooks-api --force
aws ecr delete-repository --repository-name yellowbooks-web --force

# 6. Load Balancers шалгах
aws elbv2 describe-load-balancers --region us-east-1

# 7. IAM resources устгах
aws iam delete-role --role-name GitHubActionsEKSRole
aws iam delete-policy --policy-arn arn:aws:iam::xxxxx:policy/EKSAccessPolicy
```

---

## 📊 Cost Estimation

| Service | Configuration | Monthly Cost (USD) |
|---------|---------------|-------------------|
| EKS Cluster | Control plane | $73 |
| EC2 (t3.medium x2) | Worker nodes | ~$60 |
| RDS (db.t3.micro) | PostgreSQL | ~$15 |
| ALB | Application Load Balancer | ~$20 |
| Data Transfer | Outbound | ~$10 |
| **Total** | | **~$178/month** |

**Cost optimization:**
- Spot instances ашиглах (50% хямдрах)
- Auto-scaling тохируулах
- Reserved instances авах (1-3 year commitment)

---

## ✅ Checklist

- [ ] AWS Account бэлэн
- [ ] IAM OIDC Provider үүссэн
- [ ] GitHubActionsEKSRole үүссэн
- [ ] GitHub Secrets нэмэгдсэн
- [ ] EKS Cluster ажиллаж байна
- [ ] ECR Repositories үүссэн
- [ ] RDS Database ажиллаж байна
- [ ] AWS Load Balancer Controller суусан
- [ ] ACM Certificate approved
- [ ] Route 53 DNS тохируулсан
- [ ] Kubernetes manifests бэлэн
- [ ] GitHub Actions workflow ажиллаж байна
- [ ] HTTPS ажиллаж байна
- [ ] Application accessible

---

**Next:** Push to `main` branch → GitHub Actions автоматаар deploy хийнэ! 🚀
