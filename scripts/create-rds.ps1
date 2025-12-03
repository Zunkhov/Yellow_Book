# Create RDS PostgreSQL Database for Yellow Book Application

$CLUSTER_NAME = "yellowbooks-cluster"
$REGION = "eu-north-1"
$DB_INSTANCE_ID = "yellowbooks-db"
$DB_NAME = "yellowbooks"
$DB_USERNAME = "yellowbooks_admin"
$DB_PASSWORD = "YellowBooks2025SecurePassword!"  # Change this!
$DB_INSTANCE_CLASS = "db.t3.micro"
$ALLOCATED_STORAGE = 20

Write-Host "Getting EKS cluster VPC and security group..." -ForegroundColor Cyan

# Get VPC ID from EKS cluster
$VPC_ID = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.resourcesVpcConfig.vpcId" --output text

if (-not $VPC_ID) {
    Write-Host "Failed to get VPC ID from EKS cluster" -ForegroundColor Red
    exit 1
}

Write-Host "VPC ID: $VPC_ID" -ForegroundColor Green

# Get subnets from VPC
$SUBNET_IDS = aws ec2 describe-subnets --region $REGION --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:aws:cloudformation:logical-id,Values=SubnetPrivate*" --query "Subnets[*].SubnetId" --output text

if (-not $SUBNET_IDS) {
    Write-Host "No private subnets found, using all subnets..." -ForegroundColor Yellow
    $SUBNET_IDS = aws ec2 describe-subnets --region $REGION --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text
}

$SUBNET_ARRAY = $SUBNET_IDS -split '\s+'
Write-Host "Subnets: $($SUBNET_ARRAY -join ', ')" -ForegroundColor Green

# Create DB subnet group
Write-Host "Creating DB subnet group..." -ForegroundColor Cyan
aws rds create-db-subnet-group `
    --db-subnet-group-name yellowbooks-db-subnet `
    --db-subnet-group-description "Subnet group for Yellow Books RDS" `
    --subnet-ids $SUBNET_ARRAY `
    --region $REGION

# Get EKS cluster security group
$CLUSTER_SG = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --output text

Write-Host "Cluster Security Group: $CLUSTER_SG" -ForegroundColor Green

# Create security group for RDS
Write-Host "Creating RDS security group..." -ForegroundColor Cyan
$RDS_SG_ID = aws ec2 create-security-group `
    --group-name yellowbooks-rds-sg `
    --description "Security group for Yellow Books RDS" `
    --vpc-id $VPC_ID `
    --region $REGION `
    --query "GroupId" `
    --output text

Write-Host "RDS Security Group: $RDS_SG_ID" -ForegroundColor Green

# Allow PostgreSQL access from EKS cluster
Write-Host "Allowing PostgreSQL access from EKS cluster..." -ForegroundColor Cyan
aws ec2 authorize-security-group-ingress `
    --group-id $RDS_SG_ID `
    --protocol tcp `
    --port 5432 `
    --source-group $CLUSTER_SG `
    --region $REGION

# Create RDS instance
Write-Host "Creating RDS PostgreSQL instance..." -ForegroundColor Cyan
Write-Host "This will take 5-10 minutes..." -ForegroundColor Yellow

aws rds create-db-instance `
    --db-instance-identifier $DB_INSTANCE_ID `
    --db-instance-class $DB_INSTANCE_CLASS `
    --engine postgres `
    --engine-version 16.3 `
    --master-username $DB_USERNAME `
    --master-user-password $DB_PASSWORD `
    --allocated-storage $ALLOCATED_STORAGE `
    --vpc-security-group-ids $RDS_SG_ID `
    --db-subnet-group-name yellowbooks-db-subnet `
    --db-name $DB_NAME `
    --backup-retention-period 7 `
    --no-multi-az `
    --no-publicly-accessible `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "RDS instance creation initiated!" -ForegroundColor Green
    Write-Host "Waiting for instance to become available..." -ForegroundColor Yellow
    
    aws rds wait db-instance-available --db-instance-identifier $DB_INSTANCE_ID --region $REGION
    
    # Get RDS endpoint
    $RDS_ENDPOINT = aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_ID --region $REGION --query "DBInstances[0].Endpoint.Address" --output text
    
    Write-Host ""
    Write-Host "RDS Database created successfully!" -ForegroundColor Green
    Write-Host "Endpoint: $RDS_ENDPOINT" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DATABASE_URL: postgresql://${DB_USERNAME}:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/${DB_NAME}" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Save this DATABASE_URL as a Kubernetes secret!" -ForegroundColor Yellow
} else {
    Write-Host "Failed to create RDS instance" -ForegroundColor Red
    exit 1
}
