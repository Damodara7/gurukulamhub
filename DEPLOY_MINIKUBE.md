# Deploy to Minikube - Step by Step Guide

## Prerequisites Check

- [x] Minikube installed
- [ ] Minikube running
- [ ] kubectl configured

## Step 1: Start Minikube

```powershell
# Start minikube (if not already running)
minikube start

# Verify minikube is running
minikube status

# Should show: Running, Running, Running
```

**If minikube is not running:**
```powershell
minikube start --driver=hyperv  # For Windows with Hyper-V
# OR
minikube start --driver=docker  # For Windows with Docker Desktop
```

## Step 2: Configure Docker to Use Minikube's Docker

**Important:** You need to build the image inside minikube's Docker environment.

```powershell
# Point your Docker client to minikube's Docker daemon
minikube docker-env | Invoke-Expression

# Verify you're using minikube's Docker
docker ps
# Should show minikube containers
```

**Note:** This only works for the current PowerShell session. If you open a new terminal, run this command again.

## Step 3: Build Docker Image in Minikube

```powershell
# Make sure you're in the project directory
cd C:\GurukulamHub\gurukulamhub

# Build the image (now using minikube's Docker)
docker build -t gurukulamhub-app:latest .

# Verify image was created
docker images | grep gurukulamhub
```

**Expected output:** You should see `gurukulamhub-app:latest` in the image list.

## Step 4: Enable Minikube Addons (Optional but Recommended)

```powershell
# Enable ingress addon (for domain routing)
minikube addons enable ingress

# Enable metrics server (for resource monitoring)
minikube addons enable metrics-server

# Check addon status
minikube addons list
```

## Step 5: Create Kubernetes Namespace

```powershell
# Create namespace
kubectl create namespace gurukulamhub

# Verify
kubectl get namespaces | grep gurukulamhub
```

## Step 6: Choose Configuration Approach

### Option A: Quick Setup (Development) ⚡

```powershell
# Apply ConfigMap with all values
kubectl apply -f k8s/configmap-all.yaml

# Verify
kubectl get configmap -n gurukulamhub
```

### Option B: Secure Setup (Production) 🔒

```powershell
# 1. Create ConfigMap (non-sensitive)
kubectl apply -f k8s/configmap.yaml

# 2. Create Secrets (replace values with your actual secrets)
kubectl create secret generic gurukulamhub-secrets `
  --from-literal=DATABASE_URL='mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0' `
  --from-literal=NEXTAUTH_URL='http://gurukulamhub.org' `
  --from-literal=NEXTAUTH_SECRET='LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=' `
  --from-literal=GOOGLE_CLIENT_SECRET='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' `
  --from-literal=RECAPTCHA_SECRET_KEY='6LdybtIrAAAAAODGKuB-bcesbOlM_qsd1V7SXmEA' `
  --from-literal=NEXT_PUBLIC_STRIPE_SECRET_KEY='sk_test_51OZar7SBB7wnYOSIxgxrydQim2M1f1oVPg6ty5yiU7McIYKM1qCwj7fDibjlXCqOps8xMZsDIk686MqiDDh3TsF500xWdlk6VD' `
  --from-literal=NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET='Q4PzKTVGQfcyKt3dmtcmrAeLeYPRm0LTNaTcYSgo' `
  -n gurukulamhub

# Add all other secrets from your dev.env file...
```

**Recommendation:** Use **Option A** for quick testing with minikube.

## Step 7: Deploy Redis

```powershell
# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod -l app=gurukulamhub-redis -n gurukulamhub --timeout=60s

# Check Redis status
kubectl get pods -n gurukulamhub | grep redis
```

## Step 8: Update Deployment for Minikube

**Important:** Update `k8s/deployment.yaml` to use local image:

```yaml
# In k8s/deployment.yaml, ensure:
image: gurukulamhub-app:latest
imagePullPolicy: IfNotPresent  # This is important for local images
```

The deployment should already have this, but verify it.

## Step 9: Deploy Application

```powershell
# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get deployments -n gurukulamhub

# Watch pods starting
kubectl get pods -n gurukulamhub -w
```

**Wait for pods to be ready** (status should be `Running`):
```powershell
kubectl wait --for=condition=ready pod -l app=gurukulamhub-app -n gurukulamhub --timeout=120s
```

## Step 10: Create Service

```powershell
# Create service
kubectl apply -f k8s/service.yaml

# Verify service
kubectl get svc -n gurukulamhub
```

## Step 11: Deploy Ingress (for Domain Access)

```powershell
# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Check ingress
kubectl get ingress -n gurukulamhub

# Get minikube IP
minikube ip
```

## Step 12: Configure Local DNS

### For Windows:

1. **Open hosts file as Administrator:**
   ```powershell
   notepad C:\Windows\System32\drivers\etc\hosts
   ```

2. **Add this line (replace with minikube IP):**
   ```
   <minikube-ip> gurukulamhub.org www.gurukulamhub.org
   ```

   **To get minikube IP:**
   ```powershell
   minikube ip
   ```

3. **Save the file**

### Alternative: Use Port Forwarding (No DNS needed)

```powershell
# Port forward to access without DNS
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
```

Then access: `http://localhost:3000`

## Step 13: Access Your Application

### Option 1: Via Port Forward (Easiest)

```powershell
# In one terminal, run port forward
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
```

Then open browser: `http://localhost:3000`

### Option 2: Via Minikube Service

```powershell
# Open service in browser
minikube service gurukulamhub-app -n gurukulamhub
```

### Option 3: Via Ingress (After DNS Configuration)

```powershell
# Get ingress URL
minikube service ingress-nginx-controller -n ingress-nginx --url

# Or access via domain (after hosts file configuration)
# http://gurukulamhub.org
```

## Step 14: Verify Deployment

```powershell
# Check all resources
kubectl get all -n gurukulamhub

# Check pod logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Test health endpoint
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
# Then in browser: http://localhost:3000/api/health
```

## Quick Commands Reference

```powershell
# View all resources
kubectl get all -n gurukulamhub

# View logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Restart deployment
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub

# Scale deployment
kubectl scale deployment gurukulamhub-app --replicas=3 -n gurukulamhub

# Port forward for testing
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub

# Get minikube IP
minikube ip

# Open minikube dashboard
minikube dashboard

# Stop minikube
minikube stop

# Delete everything
kubectl delete namespace gurukulamhub
```

## Troubleshooting

### Issue: Image not found

**Solution:**
```powershell
# Make sure you're using minikube's Docker
minikube docker-env | Invoke-Expression

# Rebuild image
docker build -t gurukulamhub-app:latest .

# Verify image exists
docker images | grep gurukulamhub
```

### Issue: Pods not starting

```powershell
# Check pod status
kubectl describe pod <pod-name> -n gurukulamhub

# Check logs
kubectl logs <pod-name> -n gurukulamhub

# Check events
kubectl get events -n gurukulamhub --sort-by='.lastTimestamp'
```

### Issue: Can't access application

```powershell
# Check service
kubectl get svc -n gurukulamhub

# Use port forward
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub

# Check ingress
kubectl get ingress -n gurukulamhub
kubectl describe ingress gurukulamhub-ingress -n gurukulamhub
```

### Issue: Build fails in minikube

```powershell
# Increase minikube resources
minikube stop
minikube start --memory=4096 --cpus=2

# Or use more resources
minikube start --memory=8192 --cpus=4
```

## Summary Checklist

- [ ] Minikube started
- [ ] Docker configured to use minikube
- [ ] Docker image built in minikube
- [ ] Namespace created
- [ ] ConfigMap/Secrets created
- [ ] Redis deployed
- [ ] Application deployed
- [ ] Service created
- [ ] Ingress deployed (optional)
- [ ] DNS configured (or using port-forward)
- [ ] Application accessible

## Next Steps

1. ✅ Test the application
2. ✅ Set up SSL/TLS (if needed)
3. ✅ Configure monitoring
4. ✅ Set up CI/CD

## Important Notes

1. **Docker Environment:** Always run `minikube docker-env | Invoke-Expression` before building images
2. **Image Pull Policy:** Must be `IfNotPresent` for local images
3. **Port Forwarding:** Easiest way to access app in minikube
4. **Resources:** Minikube needs at least 2GB RAM, 2 CPUs for this app

You're ready to deploy! Start with Step 1. 🚀


