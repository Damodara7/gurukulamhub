# Quick Start Guide - Docker & Kubernetes Deployment

This is a condensed guide to get you up and running quickly. For detailed information, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites Checklist

- [ ] Docker installed
- [ ] Kubernetes cluster running (minikube, k3s, or full cluster)
- [ ] kubectl configured
- [ ] Domain `gurukulamhub.com` pointing to your server IP (or local DNS configured)

## Quick Deployment Steps

### 1. Build Docker Image

```bash
docker build -t gurukulamhub-app:latest .
```

### 2. Test Locally (Optional)

```bash
# Create .env.production file
cp .env.production.template .env.production
# Edit .env.production with your values

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Access: http://localhost:3000
```

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Create Secrets (replace with your actual values)
kubectl create secret generic gurukulamhub-secrets \
  --from-literal=DATABASE_URL='your-mongodb-url' \
  --from-literal=NEXTAUTH_URL='https://gurukulamhub.com' \
  --from-literal=NEXTAUTH_SECRET='your-secret' \
  --from-literal=REDIS_URL='redis://gurukulamhub-redis:6379' \
  -n gurukulamhub

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Update deployment.yaml with your image name, then deploy
kubectl apply -f k8s/deployment.yaml

# Create Service
kubectl apply -f k8s/service.yaml

# Install Ingress Controller (if not installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

### 4. Configure DNS

**For Local Network Access:**
- Windows: Add to `C:\Windows\System32\drivers\etc\hosts`: `<server-ip> gurukulamhub.com`
- Linux/Mac: Add to `/etc/hosts`: `<server-ip> gurukulamhub.com`

**For Internet Access:**
- Configure DNS A records at your domain registrar:
  - `gurukulamhub.com` → `<your-server-ip>`
  - `www.gurukulamhub.com` → `<your-server-ip>`

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n gurukulamhub

# Check pods
kubectl get pods -n gurukulamhub

# View logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Test health endpoint
curl http://gurukulamhub.com/api/health
```

## Common Commands

```bash
# View logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Scale deployment
kubectl scale deployment gurukulamhub-app --replicas=3 -n gurukulamhub

# Restart deployment
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub

# Update image
kubectl set image deployment/gurukulamhub-app app=gurukulamhub-app:v1.1.0 -n gurukulamhub

# Port forward for testing
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
```

## Troubleshooting

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n gurukulamhub
kubectl logs <pod-name> -n gurukulamhub
```

**Application not accessible:**
```bash
# Check ingress
kubectl get ingress -n gurukulamhub
kubectl describe ingress gurukulamhub-ingress -n gurukulamhub

# Check service
kubectl get svc -n gurukulamhub
```

**DNS issues:**
```bash
nslookup gurukulamhub.com
dig gurukulamhub.com
```

## Next Steps

1. Set up SSL/TLS with Let's Encrypt (see DEPLOYMENT_GUIDE.md)
2. Configure monitoring and logging
3. Set up CI/CD pipeline
4. Configure backups

For detailed information, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

