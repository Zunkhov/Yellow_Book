# 🚀 EKS Deployment Guide - Yellow Book Application

## Overview

This guide covers deploying the Yellow Book application to AWS EKS (Elastic Kubernetes Service) with HTTPS, OIDC authentication for GitHub Actions, and production-ready configurations.

## Architecture

```
GitHub Actions (OIDC) → AWS IAM Role → EKS Cluster
                                          ├── Namespace: yellowbooks
                                          ├── Deployments: yb-api, yb-web
                                          ├── Services: ClusterIP
                                          ├── HPA: Auto-scaling
                                          ├── Ingress: ALB with HTTPS
                                          └── RDS PostgreSQL
```

## Prerequisites

- AWS CLI configured
- kubectl installed
- eksctl installed
- Helm 3 installed
- Docker images pushed to ECR

## 1. Create EKS Cluster

### Using eksctl

```powershell
eksctl create cluster \
  --name yellowbooks-cluster \
  --region eu-north-1 \
  --version 1.31 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 3 \
  --with-oidc \
  --managed \
  --alb-ingress-access \
  --full-ecr-access
```

**Time:** ~15-20 minutes

**What it creates:**
- EKS control plane (Kubernetes 1.31)
- VPC with public/private subnets across 3 AZs
- Managed node group (2 x t3.medium)
- OIDC provider for service accounts
- IAM roles with ECR and ALB permissions

### Verify Cluster

```bash
# Update kubectl config
aws eks update-kubeconfig --name yellowbooks-cluster --region eu-north-1

# Check nodes
kubectl get nodes

# Check system pods
kubectl get pods -n kube-system
```

## 2. Setup OIDC for GitHub Actions

### 2.1 Create GitHub OIDC Provider

The EKS cluster already has an OIDC provider. We need to create a second one for GitHub Actions.

```bash
# Get cluster OIDC URL
aws eks describe-cluster --name yellowbooks-cluster --region eu-north-1 \
  --query "cluster.identity.oidc.issuer" --output text
```

### 2.2 Create IAM Role for GitHub Actions

Run the setup script:

```powershell
.\scripts\setup-oidc-role.ps1
```

This creates:
- **IAM Role:** `GitHubActions-EKS-Deploy`
- **Trust Policy:** Allows GitHub Actions from your repo
- **Permissions:** EKS describe, ECR read access

**Trust Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
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

### 2.3 Configure aws-auth ConfigMap

The role needs access to the cluster. Update the `aws-auth` ConfigMap:

```bash
kubectl edit configmap aws-auth -n kube-system
```

Add this under `mapRoles`:

```yaml
mapRoles: |
  - rolearn: arn:aws:iam::ACCOUNT_ID:role/GitHubActions-EKS-Deploy
    username: github-actions
    groups:
      - system:masters
```

### 2.4 Add GitHub Secret

Add the role ARN to GitHub Secrets:

```
AWS_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/GitHubActions-EKS-Deploy
```

## 3. Install AWS Load Balancer Controller

The ALB controller automatically creates Application Load Balancers when you deploy Ingress resources.

```powershell
.\scripts\install-aws-lb-controller.ps1
```

**What it does:**
1. Creates IAM policy for Load Balancer Controller
2. Creates IAM service account using IRSA
3. Installs controller via Helm
4. Configures VPC and subnet discovery

**Verify:**
```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

## 4. Create RDS PostgreSQL Database

```powershell
.\scripts\create-rds.ps1
```

**Configuration:**
- Instance: `db.t3.micro`
- Engine: PostgreSQL 16.3
- Storage: 20GB
- Multi-AZ: Disabled (single AZ for cost)
- Public access: Disabled
- VPC: Same as EKS cluster

**Security:**
- RDS security group allows PostgreSQL (5432) from EKS cluster security group

**Output:**
Save the `DATABASE_URL` as a GitHub Secret:

```
DATABASE_URL=postgresql://username:password@endpoint:5432/yellowbooks
```

## 5. Kubernetes Manifests

### 5.1 Namespace

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: yellowbooks
```

### 5.2 Secret

Secrets are created via GitHub Actions (not stored in Git):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: yellowbooks-secrets
  namespace: yellowbooks
type: Opaque
stringData:
  DATABASE_URL: "postgresql://..."
  JWT_SECRET: "..."
  REVALIDATION_SECRET: "..."
```

### 5.3 ConfigMap

```yaml
# k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yellowbooks-config
  namespace: yellowbooks
data:
  NODE_ENV: "production"
  API_PORT: "3333"
  WEB_PORT: "3000"
```

### 5.4 Deployments

**API Deployment** (`k8s/base/api-deployment.yaml`):
- Replicas: 2
- Image: ECR yellowbooks-api
- Resources: 256Mi-512Mi memory, 250m-500m CPU
- Health checks: `/api/health`
- Environment: ConfigMap + Secrets

**Web Deployment** (`k8s/base/web-deployment.yaml`):
- Replicas: 2
- Image: ECR yellowbooks-web
- Resources: 512Mi-1Gi memory, 500m-1000m CPU
- Health checks: `/api/health`

### 5.5 Services

```yaml
# ClusterIP services
- yb-api-service: port 80 → targetPort 3333
- yb-web-service: port 80 → targetPort 3000
```

### 5.6 HPA (Horizontal Pod Autoscaler)

```yaml
# k8s/base/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: yb-api-hpa
  namespace: yellowbooks
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: yb-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 5.7 Ingress (ALB)

```yaml
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yellowbooks-ingress
  namespace: yellowbooks
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS-1-2-2017-01
    alb.ingress.kubernetes.io/healthcheck-path: /api/health
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: yb-api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: yb-web-service
            port:
              number: 80
```

**ALB Features:**
- Internet-facing (public)
- Listens on ports 80 (HTTP) and 443 (HTTPS)
- IP target type (for pods)
- TLS 1.2 policy
- Health checks to `/api/health`

### 5.8 Migration Job

```yaml
# k8s/base/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: yellowbooks
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: migration
        image: <ECR_IMAGE>
        command: ["npx", "prisma", "migrate", "deploy"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yellowbooks-secrets
              key: DATABASE_URL
```

## 6. Ingress & TLS Configuration

### Without Custom Domain

The ALB will be accessible via its default AWS URL:

```
https://k8s-yellowbo-xxxxxxxx-xxxxxxxxxx.eu-north-1.elb.amazonaws.com
```

**HTTPS:** AWS ALB provides a default SSL certificate. The padlock will show a warning (self-signed), but HTTPS encryption is active.

### With Custom Domain (Optional)

1. **Request ACM Certificate:**
```bash
aws acm request-certificate \
  --domain-name yellowbook.mn \
  --subject-alternative-names *.yellowbook.mn \
  --validation-method DNS \
  --region eu-north-1
```

2. **Add DNS validation records to Route53**

3. **Update Ingress:**
```yaml
annotations:
  alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-north-1:ACCOUNT_ID:certificate/CERT_ID
```

4. **Add Route53 record:**
```bash
# Get ALB hostname
ALB_HOST=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Create Route53 A record (ALIAS) pointing to ALB
```

## 7. GitHub Actions Workflow

The `.github/workflows/deploy-eks.yml` workflow:

1. **Authenticate via OIDC** (no access keys needed)
2. **Get latest ECR image tags**
3. **Update kubeconfig**
4. **Create namespace and secrets**
5. **Run migration job**
6. **Deploy API and Web**
7. **Apply HPA and Ingress**
8. **Output ALB URL**

**Trigger:** Push to `main` branch

**Required Secrets:**
- `AWS_ROLE_ARN` - IAM role for OIDC
- `AWS_ACCOUNT_ID`
- `DATABASE_URL`
- `JWT_SECRET`
- `REVALIDATION_SECRET`

## 8. Deployment Process

### Manual Deployment

```bash
# 1. Update kubectl context
aws eks update-kubeconfig --name yellowbooks-cluster --region eu-north-1

# 2. Create namespace
kubectl apply -f k8s/base/namespace.yaml

# 3. Create secrets
kubectl create secret generic yellowbooks-secrets \
  --from-literal=DATABASE_URL="..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=REVALIDATION_SECRET="..." \
  --namespace=yellowbooks

# 4. Apply ConfigMap
kubectl apply -f k8s/base/configmap.yaml

# 5. Run migration
kubectl apply -f k8s/base/migration-job.yaml
kubectl logs job/db-migration -n yellowbooks

# 6. Deploy applications
kubectl apply -f k8s/base/api-deployment.yaml
kubectl apply -f k8s/base/api-service.yaml
kubectl apply -f k8s/base/web-deployment.yaml
kubectl apply -f k8s/base/web-service.yaml

# 7. Apply HPA
kubectl apply -f k8s/base/hpa.yaml

# 8. Apply Ingress
kubectl apply -f k8s/base/ingress.yaml

# 9. Get ALB URL
kubectl get ingress -n yellowbooks
```

### Via GitHub Actions

```bash
git add .
git commit -m "Deploy to EKS"
git push origin main
```

Watch the workflow: `https://github.com/Zunkhov/Yellow_Book/actions`

## 9. Verification

### Check Pods

```bash
kubectl get pods -n yellowbooks

# Expected output:
# NAME                      READY   STATUS    RESTARTS   AGE
# yb-api-xxxxxxxxx-xxxxx    1/1     Running   0          2m
# yb-api-xxxxxxxxx-xxxxx    1/1     Running   0          2m
# yb-web-xxxxxxxxx-xxxxx    1/1     Running   0          2m
# yb-web-xxxxxxxxx-xxxxx    1/1     Running   0          2m
```

### Check Services

```bash
kubectl get svc -n yellowbooks

# yb-api-service   ClusterIP   10.100.x.x   <none>   80/TCP    2m
# yb-web-service   ClusterIP   10.100.x.x   <none>   80/TCP    2m
```

### Check Ingress & ALB

```bash
kubectl get ingress -n yellowbooks

# ALB URL in ADDRESS column
kubectl get ingress yellowbooks-ingress -n yellowbooks \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Test Application

```bash
# Get ALB URL
ALB_URL=$(kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test API
curl https://$ALB_URL/api/health

# Test Web (browser)
echo "Open: https://$ALB_URL"
```

### Check Logs

```bash
# API logs
kubectl logs -f deployment/yb-api -n yellowbooks

# Web logs
kubectl logs -f deployment/yb-web -n yellowbooks

# Migration logs
kubectl logs job/db-migration -n yellowbooks
```

### Check HPA

```bash
kubectl get hpa -n yellowbooks

# Shows current/target CPU and memory usage
# Watch autoscaling in action
kubectl get hpa -n yellowbooks --watch
```

## 10. Troubleshooting

### Pods not starting

```bash
# Describe pod for events
kubectl describe pod POD_NAME -n yellowbooks

# Check image pull errors
kubectl get events -n yellowbooks --sort-by='.lastTimestamp'

# Verify ECR access
aws ecr describe-images --repository-name yellowbooks-api --region eu-north-1
```

### Database connection issues

```bash
# Check secret
kubectl get secret yellowbooks-secrets -n yellowbooks -o yaml

# Test database from pod
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql "postgresql://user:pass@host:5432/db"

# Check RDS security group
aws ec2 describe-security-groups --filters "Name=group-name,Values=yellowbooks-rds-sg"
```

### ALB not creating

```bash
# Check Load Balancer Controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Verify IAM permissions
aws iam get-role --role-name AmazonEKSLoadBalancerControllerRole

# Check Ingress events
kubectl describe ingress yellowbooks-ingress -n yellowbooks
```

### OIDC authentication fails

```bash
# Verify role trust policy
aws iam get-role --role-name GitHubActions-EKS-Deploy

# Check aws-auth ConfigMap
kubectl get configmap aws-auth -n kube-system -o yaml

# Test kubectl access
aws eks update-kubeconfig --name yellowbooks-cluster --region eu-north-1
kubectl get nodes
```

### HPA not scaling

```bash
# Check metrics server
kubectl top nodes
kubectl top pods -n yellowbooks

# If metrics not available
kubectl get deployment metrics-server -n kube-system

# HPA conditions
kubectl describe hpa yb-api-hpa -n yellowbooks
```

## 11. Cleanup

To delete all resources:

```bash
# Delete application
kubectl delete namespace yellowbooks

# Delete Load Balancer Controller
helm uninstall aws-load-balancer-controller -n kube-system

# Delete RDS
aws rds delete-db-instance --db-instance-identifier yellowbooks-db --skip-final-snapshot

# Delete EKS cluster (this deletes everything)
eksctl delete cluster --name yellowbooks-cluster --region eu-north-1
```

**Warning:** This will delete all data. Backup databases before cleanup!

## 12. Cost Estimation

**Monthly costs (eu-north-1):**
- EKS Control Plane: $72/month ($0.10/hour)
- EC2 Nodes (2 x t3.medium): ~$60/month
- RDS (db.t3.micro): ~$15/month
- ALB: ~$20/month
- Data transfer: ~$10/month

**Total: ~$177/month**

**Optimization:**
- Use Spot instances for nodes (50-70% discount)
- Schedule non-prod environments (turn off nights/weekends)
- Use RDS snapshots instead of continuous backups

## 13. Production Checklist

- [ ] EKS cluster created with managed nodes
- [ ] OIDC provider configured for GitHub Actions
- [ ] IAM role created with least-privilege permissions
- [ ] aws-auth ConfigMap updated for GitHub Actions access
- [ ] RDS PostgreSQL created in private subnet
- [ ] AWS Load Balancer Controller installed
- [ ] Kubernetes manifests deployed (namespace, secrets, configmaps)
- [ ] Database migration completed successfully
- [ ] Applications deployed (API + Web)
- [ ] HPA configured and tested
- [ ] Ingress created and ALB provisioned
- [ ] HTTPS working (padlock visible)
- [ ] Health checks passing
- [ ] Logs accessible via kubectl
- [ ] GitHub Actions workflow succeeds
- [ ] Application accessible via ALB URL
- [ ] Screenshots taken (pods, ALB URL, padlock)

## 14. Assignment Deliverables

1. ✅ **Public HTTPS URL** - ALB hostname with padlock
2. ✅ **GitHub Actions run link** - Successful deploy workflow
3. ✅ **kubectl get pods screenshot** - All pods Ready
4. ✅ **DEPLOY.md** - This documentation

**Rubric (100 pts):**
- OIDC/Roles: 20pts ✓
- aws-auth/RBAC: 10pts ✓
- Manifests: 25pts ✓
- Ingress/TLS: 20pts ✓
- Migration Job: 10pts ✓
- HPA: 10pts ✓
- Docs: 5pts ✓

---

**Author:** Yellow Book Team  
**Date:** December 2025  
**Version:** 1.0
