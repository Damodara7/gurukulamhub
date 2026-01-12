# Docker & Kubernetes Deployment Summary

## Overview

This document provides a high-level overview of the Docker and Kubernetes deployment setup for GurukulamHub Next.js application.

## Files Created

### Docker Files
- **Dockerfile** - Multi-stage build for Next.js application
- **.dockerignore** - Excludes unnecessary files from Docker build
- **docker-compose.yml** - Local testing with Docker Compose

### Kubernetes Files
- **k8s/namespace.yaml** - Kubernetes namespace
- **k8s/configmap.yaml** - Non-sensitive configuration
- **k8s/secret.yaml.template** - Template for sensitive data (secrets)
- **k8s/redis-deployment.yaml** - Redis deployment, service, and PVC
- **k8s/deployment.yaml** - Application deployment
- **k8s/service.yaml** - Kubernetes service
- **k8s/ingress.yaml** - Ingress for gurukulamhub.com domain

### Configuration Files
- **.env.production.template** - Production environment variables template
- **src/app/api/health/route.js** - Health check endpoint for Kubernetes probes

### Documentation
- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment guide
- **QUICK_START.md** - Quick reference guide
- **DOCKER_K8S_SUMMARY.md** - This file

## Step-by-Step Flow

### Phase 1: Docker Image Creation

1. **Build Docker Image**
   ```bash
   docker build -t gurukulamhub-app:latest .
   ```
   - Stage 1: Install dependencies
   - Stage 2: Build Next.js application (generates standalone output)
   - Stage 3: Create minimal runtime image

2. **Test Locally (Optional)**
   ```bash
   docker-compose up -d
   ```
   - Tests the Docker image with Redis
   - Access at http://localhost:3000

### Phase 2: Kubernetes Setup

1. **Create Namespace**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```
   - Creates isolated namespace: `gurukulamhub`

2. **Create ConfigMap**
   ```bash
   kubectl apply -f k8s/configmap.yaml
   ```
   - Stores non-sensitive configuration

3. **Create Secrets**
   ```bash
   kubectl create secret generic gurukulamhub-secrets \
     --from-literal=DATABASE_URL='...' \
     --from-literal=NEXTAUTH_SECRET='...' \
     ... (other secrets)
     -n gurukulamhub
   ```
   - Stores sensitive data (database URLs, API keys, etc.)

4. **Deploy Redis**
   ```bash
   kubectl apply -f k8s/redis-deployment.yaml
   ```
   - Deploys Redis with persistent storage
   - Creates service for internal communication

5. **Deploy Application**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```
   - Deploys Next.js application
   - Uses ConfigMap and Secrets for configuration
   - Connects to Redis service

6. **Create Service**
   ```bash
   kubectl apply -f k8s/service.yaml
   ```
   - Exposes application internally in cluster
   - Load balances between pod replicas

7. **Install Ingress Controller** (if not installed)
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

8. **Deploy Ingress**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```
   - Routes external traffic to service
   - Configures domain: gurukulamhub.com

### Phase 3: DNS Configuration

1. **Get Server IP**
   ```bash
   curl ifconfig.me  # For public IP
   # Or use local network IP
   ```

2. **Configure DNS**
   - **Local Network**: Edit hosts file on each device
   - **Internet**: Configure DNS A records at domain registrar
   - Point `gurukulamhub.com` and `www.gurukulamhub.com` to server IP

### Phase 4: SSL/TLS (Optional but Recommended)

1. **Install cert-manager**
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

2. **Create ClusterIssuer** for Let's Encrypt

3. **Update Ingress** to use TLS

## Architecture Diagram

```
Internet
   |
   v
[Ingress Controller]
   |
   v
[Kubernetes Ingress] (gurukulamhub.com)
   |
   v
[Service] (ClusterIP)
   |
   v
[Deployment] (2+ replicas)
   |
   +-- [Pod 1] (Next.js App)
   +-- [Pod 2] (Next.js App)
   |
   v
[Redis Service] <-- [Redis Pod]
   |
   v
[Persistent Volume] (Redis data)
```

## Key Components

### Docker Image
- **Base**: node:18-alpine (lightweight)
- **Build**: Multi-stage (deps → builder → runner)
- **Output**: Standalone Next.js build
- **Size**: Optimized (~200-300MB)

### Kubernetes Resources
- **Namespace**: Isolated environment
- **Deployment**: Manages pod replicas
- **Service**: Internal load balancing
- **Ingress**: External routing with SSL
- **ConfigMap**: Non-sensitive config
- **Secrets**: Sensitive data
- **PVC**: Persistent storage for Redis

## Environment Variables

### Required in Secrets
- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `REDIS_URL` - Redis connection (use service name: `redis://gurukulamhub-redis:6379`)

### Optional in ConfigMap
- `NODE_ENV` - Environment (production)
- `PORT` - Application port (3000)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - ReCAPTCHA site key

## Access Points

1. **Local Testing**: `http://localhost:3000` (port-forward)
2. **Cluster Internal**: `http://gurukulamhub-app.gurukulamhub.svc.cluster.local`
3. **External**: `https://gurukulamhub.com` (via Ingress)

## Scaling

```bash
# Scale horizontally
kubectl scale deployment gurukulamhub-app --replicas=5 -n gurukulamhub

# Auto-scaling (requires metrics server)
kubectl autoscale deployment gurukulamhub-app \
  --min=2 --max=10 --cpu-percent=80 \
  -n gurukulamhub
```

## Monitoring

### Health Checks
- **Liveness Probe**: `/api/health` (checks if app is running)
- **Readiness Probe**: `/api/health` (checks if app is ready)

### Logs
```bash
# Application logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Redis logs
kubectl logs -f deployment/gurukulamhub-redis -n gurukulamhub

# All events
kubectl get events -n gurukulamhub --sort-by='.lastTimestamp'
```

## Updates & Rollbacks

### Update Application
```bash
# Build new image
docker build -t gurukulamhub-app:v1.1.0 .

# Update deployment
kubectl set image deployment/gurukulamhub-app \
  app=gurukulamhub-app:v1.1.0 \
  -n gurukulamhub

# Monitor rollout
kubectl rollout status deployment/gurukulamhub-app -n gurukulamhub
```

### Rollback
```bash
# View history
kubectl rollout history deployment/gurukulamhub-app -n gurukulamhub

# Rollback to previous
kubectl rollout undo deployment/gurukulamhub-app -n gurukulamhub
```

## Security Considerations

1. **Secrets Management**: Never commit secrets to git
2. **RBAC**: Restrict access to namespace
3. **Network Policies**: Restrict pod-to-pod communication
4. **TLS/SSL**: Always use HTTPS in production
5. **Resource Limits**: Set CPU/memory limits
6. **Non-root User**: Dockerfile runs as non-root user

## Troubleshooting Quick Reference

| Issue | Command |
|-------|---------|
| Pods not starting | `kubectl describe pod <pod-name> -n gurukulamhub` |
| View logs | `kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub` |
| Check service | `kubectl get svc -n gurukulamhub` |
| Check ingress | `kubectl describe ingress -n gurukulamhub` |
| Test connectivity | `kubectl exec -it <pod-name> -n gurukulamhub -- sh` |
| Check events | `kubectl get events -n gurukulamhub` |

## Next Steps

1. ✅ Docker image created
2. ✅ Kubernetes manifests created
3. ⏭️ Deploy to cluster
4. ⏭️ Configure DNS
5. ⏭️ Set up SSL/TLS
6. ⏭️ Configure monitoring
7. ⏭️ Set up CI/CD
8. ⏭️ Configure backups

## Support

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference

