# 🚀 Deployment Steps - Follow This Guide

## Prerequisites Check

Before starting, ensure you have:
- [ ] Docker installed and running
- [ ] Kubernetes cluster running (minikube, k3s, or full cluster)
- [ ] kubectl configured and connected to your cluster
- [ ] Domain `gurukulamhub.com` pointing to your server (or local DNS configured)

---

## Step 1: Build Docker Image

```bash
# Navigate to project root
cd /path/to/gurukulamhub

# Build the Docker image
docker build -t gurukulamhub-app:latest .

# Verify image was created
docker images | grep gurukulamhub
```

**Expected output:** You should see `gurukulamhub-app:latest` in the list.

---

## Step 2: Choose Configuration Approach

### Option A: Quick Setup (Development/Testing) ⚡

**Use single ConfigMap with everything:**

```bash
# Create namespace
kubectl create namespace gurukulamhub

# Apply ConfigMap with all values
kubectl apply -f k8s/configmap-all.yaml

# Verify
kubectl get configmap -n gurukulamhub
```

**Then update deployment to use only ConfigMap:**
- Edit `k8s/deployment.yaml`
- Remove the `secretRef` section from `envFrom`
- Keep only `configMapRef`

### Option B: Secure Setup (Production) 🔒

**Use ConfigMap + Secrets:**

```bash
# Create namespace
kubectl create namespace gurukulamhub

# 1. Create ConfigMap (non-sensitive)
kubectl apply -f k8s/configmap.yaml

# 2. Create Secrets (sensitive data)
# Replace the values with your actual secrets from dev.env
kubectl create secret generic gurukulamhub-secrets \
  --from-literal=DATABASE_URL='mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0' \
  --from-literal=NEXTAUTH_URL='https://gurukulamhub.com' \
  --from-literal=NEXTAUTH_SECRET='LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=' \
  --from-literal=GOOGLE_CLIENT_ID='872140549132-k3ndunp63cl0j05mmi9uh1bctrt0pla9.apps.googleusercontent.com' \
  --from-literal=GOOGLE_CLIENT_SECRET='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' \
  --from-literal=API_URL='https://gurukulamhub.com/api' \
  --from-literal=NEXT_PUBLIC_API_URL='https://gurukulamhub.com/api' \
  --from-literal=REDIS_URL='redis://gurukulamhub-redis:6379' \
  --from-literal=RECAPTCHA_SECRET_KEY='6LdybtIrAAAAAODGKuB-bcesbOlM_qsd1V7SXmEA' \
  --from-literal=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_51OZar7SBB7wnYOSIs4gZrZqWeEJFlGlKP0KUREQBdJFn4TytYos3hfNb7XSTDeEjZmC0oaNOzZL4MeFrE34SrkXF00rWrNG7Yh' \
  --from-literal=NEXT_PUBLIC_STRIPE_SECRET_KEY='sk_test_51OZar7SBB7wnYOSIxgxrydQim2M1f1oVPg6ty5yiU7McIYKM1qCwj7fDibjlXCqOps8xMZsDIk686MqiDDh3TsF500xWdlk6VD' \
  --from-literal=NEXT_PUBLIC_SOCKET_IO_SERVER='https://gurukulamhub.com' \
  --from-literal=SOCKET_SERVER_URL='https://gurukulamhub.com' \
  --from-literal=BASEPATH='' \
  --from-literal=DOMAIN='gurukulamhub.com' \
  --from-literal=NEXT_PUBLIC_APP_URL='https://gurukulamhub.com' \
  --from-literal=NEXTAUTH_BASEPATH='/api/auth' \
  --from-literal=AUTH_TRUST_HOST='https://gurukulamhub.com' \
  --from-literal=MONGODB_URI='mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0' \
  --from-literal=MONGODB_DB='gurkulhub' \
  --from-literal=REDIS_PORT='6379' \
  --from-literal=REDIS_HOST='gurukulamhub-redis' \
  --from-literal=NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID='AKIAU6GDX5HJIHWTXVMD' \
  --from-literal=NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET='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' \
  --from-literal=NEXT_PUBLIC_AWS_S3_GAMES_UPLOAD_BUCKET='squizmegames' \
  --from-literal=NEXT_PUBLIC_AWS_S3_REGION='ap-south-1' \
  --from-literal=NEXT_PUBLIC_AWS_S3_USERPROFILE_UPLOAD_BUCKET='squizme-userprofile' \
  --from-literal=NEXT_PUBLIC_AWS_S3_QUIZ_UPLOAD_BUCKET='squizme-quiz' \
  --from-literal=SUPER_ADMIN_EMAIL='rnoonegen@gmail.com' \
  --from-literal=USE_FALLBACK_MUTATION='true' \
  -n gurukulamhub

# Verify
kubectl get secret -n gurukulamhub
```

**Recommendation:** Use **Option A** for quick testing, **Option B** for production.

---

## Step 3: Deploy Redis

```bash
# Deploy Redis with persistent storage
kubectl apply -f k8s/redis-deployment.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod -l app=gurukulamhub-redis -n gurukulamhub --timeout=60s

# Verify Redis is running
kubectl get pods -n gurukulamhub | grep redis
```

---

## Step 4: Update Deployment Image

**Important:** Update `k8s/deployment.yaml` with your image name:

```yaml
# For local image (minikube/k3s):
image: gurukulamhub-app:latest
imagePullPolicy: IfNotPresent

# For remote registry:
image: your-registry.com/gurukulamhub-app:latest
imagePullPolicy: Always
```

**For minikube:**
```bash
# Build image in minikube's Docker environment
eval $(minikube docker-env)
docker build -t gurukulamhub-app:latest .
```

**For k3s:**
```bash
# Build on the same machine or use local registry
docker build -t gurukulamhub-app:latest .
```

---

## Step 5: Deploy Application

```bash
# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get deployments -n gurukulamhub

# Watch pods starting
kubectl get pods -n gurukulamhub -w
```

**Wait for pods to be ready** (status should be `Running`):
```bash
kubectl wait --for=condition=ready pod -l app=gurukulamhub-app -n gurukulamhub --timeout=120s
```

---

## Step 6: Create Service

```bash
# Create service
kubectl apply -f k8s/service.yaml

# Verify service
kubectl get svc -n gurukulamhub
```

---

## Step 7: Install Ingress Controller (If Not Installed)

### For Nginx Ingress:

```bash
# Check if already installed
kubectl get pods -n ingress-nginx

# If not installed, install it:
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### For Traefik (Alternative):

```bash
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
```

---

## Step 8: Deploy Ingress

```bash
# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Check ingress
kubectl get ingress -n gurukulamhub

# Get ingress IP/address
kubectl get ingress gurukulamhub-ingress -n gurukulamhub
```

**Note the IP address** - you'll need it for DNS configuration.

---

## Step 9: Configure DNS

### For Local Network Access:

**Windows:**
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add: `<your-server-ip> gurukulamhub.com www.gurukulamhub.com`

**Linux/Mac:**
```bash
sudo nano /etc/hosts
# Add: <your-server-ip> gurukulamhub.com www.gurukulamhub.com
```

### For Internet Access:

1. **Get your server's public IP:**
   ```bash
   curl ifconfig.me
   ```

2. **Configure DNS at your domain registrar:**
   - Add A record: `gurukulamhub.com` → `<your-server-ip>`
   - Add A record: `www.gurukulamhub.com` → `<your-server-ip>`

3. **Wait for DNS propagation** (5 minutes to 48 hours)

---

## Step 10: Verify Deployment

```bash
# Check all resources
kubectl get all -n gurukulamhub

# Check pod logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Test health endpoint (via port-forward)
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
# Then in browser: http://localhost:3000/api/health

# Or test via ingress (after DNS is configured)
curl http://gurukulamhub.com/api/health
```

---

## Step 11: Access Your Application

### Via Port-Forward (Testing):
```bash
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
# Access: http://localhost:3000
```

### Via Ingress (Production):
```
http://gurukulamhub.com
# or
https://gurukulamhub.com (if SSL is configured)
```

---

## Troubleshooting

### Pods Not Starting:
```bash
# Check pod status
kubectl describe pod <pod-name> -n gurukulamhub

# Check logs
kubectl logs <pod-name> -n gurukulamhub

# Check events
kubectl get events -n gurukulamhub --sort-by='.lastTimestamp'
```

### Application Not Accessible:
```bash
# Check ingress
kubectl describe ingress gurukulamhub-ingress -n gurukulamhub

# Check service
kubectl describe svc gurukulamhub-app -n gurukulamhub

# Test connectivity
kubectl exec -it <pod-name> -n gurukulamhub -- sh
# Inside pod: wget -O- http://localhost:3000/api/health
```

### Database Connection Issues:
- Verify `DATABASE_URL` in ConfigMap/Secrets
- Check MongoDB network access
- Verify firewall rules

### Redis Connection Issues:
```bash
# Check Redis pod
kubectl logs deployment/gurukulamhub-redis -n gurukulamhub

# Test Redis connection
kubectl exec -it deployment/gurukulamhub-redis -n gurukulamhub -- redis-cli ping
```

---

## Quick Commands Reference

```bash
# View all resources
kubectl get all -n gurukulamhub

# View logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Restart deployment
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub

# Scale deployment
kubectl scale deployment gurukulamhub-app --replicas=3 -n gurukulamhub

# Update image
kubectl set image deployment/gurukulamhub-app app=gurukulamhub-app:v1.1.0 -n gurukulamhub

# Delete everything (cleanup)
kubectl delete namespace gurukulamhub
```

---

## Next Steps After Deployment

1. ✅ Set up SSL/TLS (Let's Encrypt) - See `DEPLOYMENT_GUIDE.md`
2. ✅ Configure monitoring (Prometheus, Grafana)
3. ✅ Set up logging (ELK stack)
4. ✅ Configure backups for Redis
5. ✅ Set up CI/CD pipeline

---

## Summary Checklist

- [ ] Docker image built
- [ ] Namespace created
- [ ] ConfigMap/Secrets created
- [ ] Redis deployed
- [ ] Application deployed
- [ ] Service created
- [ ] Ingress controller installed
- [ ] Ingress deployed
- [ ] DNS configured
- [ ] Application accessible
- [ ] Health check passing

**You're done! 🎉**

For detailed information, see:
- `DEPLOYMENT_GUIDE.md` - Complete guide
- `QUICK_START.md` - Quick reference
- `k8s/QUICK_REFERENCE.md` - ConfigMap options

