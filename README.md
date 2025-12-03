# 📒 Yellow Book - Монгол улсын бизнесийн лавлах

[![CI](https://github.com/Zunkhov/Yellow_Book/actions/workflows/ci.yml/badge.svg)](https://github.com/Zunkhov/Yellow_Book/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

**Yellow Book** - Монгол улсын компани, байгууллагуудын цогц мэдээлэл, байршил, холбоо барих хаягийг олоход зориулагдсан онлайн лавлах платформ.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## 🏗️ Architecture

**Monorepo Structure** (Nx Workspace):
- **`apps/adoptable`** - Next.js 14 Web Application (Frontend)
- **`apps/yb-api`** - Node.js REST API (Backend)
- **`shared-contract`** - TypeScript shared types
- **`prisma/`** - Database schema & migrations

**Tech Stack**:
- 🎨 **Frontend**: Next.js 14, React, Tailwind CSS, Leaflet Maps
- 🔧 **Backend**: Node.js, Express, Prisma ORM
- 🗄️ **Database**: PostgreSQL
- 🐳 **Containerization**: Docker, Docker Compose
- ☁️ **Cloud**: AWS (EKS, ECR, RDS, ALB)
- 🔄 **CI/CD**: GitHub Actions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- AWS CLI (for deployment)
- PostgreSQL (or use Docker)

### Local Development

```bash
# Clone repository
git clone https://github.com/Zunkhov/Yellow_Book.git
cd Yellow_Book/adoptable

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
npx prisma migrate dev

# Start development servers
npx nx serve yb-api      # API: http://localhost:3333
npx nx serve adoptable   # Web: http://localhost:3000
```

---

## 🐳 Docker Local Testing (Sanity Check)

### Option 1: Docker Compose (Recommended) ⭐

Бүх системийг нэг удаа эхлүүлэх:

```bash
cd adoptable

# Build and start all services (DB + API + Web)
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Services will be available at:**
- 🌐 **Web**: http://localhost:3000
- 🔌 **API**: http://localhost:3333/api/health
- 🗄️ **Database**: localhost:5432

**Test endpoints:**
```bash
# Test API health
curl http://localhost:3333/api/health

# Test Web homepage
curl http://localhost:3000/

# Test API yellow-books endpoint
curl http://localhost:3333/api/yellow-books
```

---

### Option 2: Individual Containers

Build and test containers manually:

#### Build Images Locally

```bash
cd adoptable

# Build API image
docker build -f apps/yb-api/Dockerfile -t yb-api:local .

# Build Web image
docker build -f apps/adoptable/Dockerfile -t yb-web:local .
```

#### Test Images

```bash
# Test API (port 3333)
docker run -d -p 3333:3333 --name test-api \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  yb-api:local

# Check logs
docker logs test-api

# Test health endpoint
curl http://localhost:3333/api/health

# Cleanup
docker stop test-api && docker rm test-api

# Test Web (port 3000)
docker run -d -p 3000:3000 --name test-web \
  -e NEXT_PUBLIC_API_URL="http://localhost:3333" \
  yb-web:local

# Check logs
docker logs test-web

# Test homepage
curl http://localhost:3000/

# Cleanup
docker stop test-web && docker rm test-web
```

---

## 📦 ECR Deployment

### ECR Repositories

**Region**: `eu-north-1` (Stockholm)

```
yellowbooks-api: <AWS_ACCOUNT_ID>.dkr.ecr.eu-north-1.amazonaws.com/yellowbooks-api
yellowbooks-web: <AWS_ACCOUNT_ID>.dkr.ecr.eu-north-1.amazonaws.com/yellowbooks-web
```

### CI/CD Pipeline

**Automatic on Push to `main`**:
1. ✅ Lint & Type check
2. 🧪 Run tests
3. 🏗️ Build Docker images (matrix build)
4. 🔍 Scan for vulnerabilities (Trivy)
5. 🏥 Health check (local container test)
6. 📤 Push to ECR with tags: `:<sha>` and `:latest`
7. 📊 Generate health report

**Manual ECR Setup**:
```powershell
# Run setup script
.\scripts\setup-ecr.ps1
```

**View Images in ECR**:
```bash
aws ecr describe-images --repository-name yellowbooks-api --region eu-north-1
aws ecr describe-images --repository-name yellowbooks-web --region eu-north-1
```

---

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev adoptable
```

To create a production bundle:

```sh
npx nx build adoptable
```

To see all available targets to run for a project, run:

```sh
npx nx show project adoptable
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


---

## 🎯 Lab Assignment Deliverables

### ✅ Rubric (100 points)

- [x] **Dockerfiles (30 pts)** - Multi-stage builds for API & Web
- [x] **Local Sanity (10 pts)** - Docker images tested locally
- [x] **ECR Repos + Policies (20 pts)** - Lifecycle policies configured
- [x] **CI Build/Push (30 pts)** - GitHub Actions with ECR push
- [x] **Docs (10 pts)** - README with badges, local test guide
- [x] **Bonus (+10 pts)** - Matrix build for push & pull_request

### 📸 Screenshots

**CI Run (Green)**: [View Actions](https://github.com/Zunkhov/Yellow_Book/actions)

**ECR Images**:
- API: `yellowbooks-api:<sha>`
- Web: `yellowbooks-web:<sha>`

---

## 🚀 EKS Deployment

### Prerequisites
- EKS Cluster running
- AWS Load Balancer Controller installed
- RDS PostgreSQL database

### Deploy

```bash
# Update kubeconfig
aws eks update-kubeconfig --name yellowbooks-cluster --region eu-north-1

# Deploy manifests
kubectl apply -f k8s/base/

# Check status
kubectl get pods -n yellowbooks
kubectl get ingress -n yellowbooks
```

See [STOCKHOLM_SETUP.md](docs/STOCKHOLM_SETUP.md) for detailed instructions.

---

## 📚 Documentation

- [AWS Setup Guide](docs/AWS_SETUP.md) - Complete AWS infrastructure setup
- [Stockholm Quick Start](docs/STOCKHOLM_SETUP.md) - 30-min Stockholm deployment
- [Lab 4 Summary](LAB4_SUMMARY.md) - ISR/SSG/SSR implementation details
- [Performance Report](perf.md) - TTFB/LCP metrics & analysis

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Zunkhov** - [GitHub](https://github.com/Zunkhov)

---

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
#   Y e l l o w _ B o o k 
 
 #   Y e l l o w _ B o o k 
 
 