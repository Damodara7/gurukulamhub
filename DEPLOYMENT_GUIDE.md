# Docker & Kubernetes Deployment Guide for GurukulamHub

This guide provides step-by-step instructions to deploy the GurukulamHub Next.js application using Docker and Kubernetes on a local server, accessible via `gurukulamhub.com`.

## Prerequisites

1. **Docker** (version 20.10+)
2. **Docker Compose** (version 2.0+)
3. **Kubernetes** (minikube, k3s, or full Kubernetes cluster)
4. **kubectl** configured to access your cluster
5. **Domain Configuration**: DNS pointing `gurukulamhub.com` to your server's IP
6. **Ingress Controller** (Nginx Ingress or Traefik)

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [Kubernetes Setup](#kubernetes-setup)
3. [DNS Configuration](#dns-configuration)
4. [SSL/TLS Setup](#ssltls-setup)
5. [Troubleshooting](#troubleshooting)

---

## Part 1: Docker Setup

### Step 1: Build Docker Image

```bash
# Build the Docker image
docker build -t gurukulamhub-app:latest .

# Verify the image was created
docker images | grep gurukulamhub
```

### Step 2: Test with Docker Compose (Optional)

Before deploying to Kubernetes, test locally with Docker Compose:

```bash
# Create production environment file
cp .env.production.template .env.production
# Edit .env.production with your actual values

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Access the application
# http://localhost:3000
```

### Step 3: Push Image to Registry (If using remote registry)

```bash
# Tag the image
docker tag gurukulamhub-app:latest your-registry.com/gurukulamhub-app:latest

# Push to registry
docker push your-registry.com/gurukulamhub-app:latest
```

**For local Kubernetes (minikube/k3s):**
- You can use local images without a registry
- For minikube: `eval $(minikube docker-env)` then build
- For k3s: Build on the same machine or use local registry

---

## Part 2: Kubernetes Setup

### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### Step 3: Create Secrets

**Option A: Using kubectl command (Recommended)**

```bash
kubectl create secret generic gurukulamhub-secrets \
  --from-literal=DATABASE_URL='your-mongodb-connection-string' \
  --from-literal=NEXTAUTH_URL='https://gurukulamhub.com' \
  --from-literal=NEXTAUTH_SECRET='your-nextauth-secret' \
  --from-literal=GOOGLE_CLIENT_ID='your-google-client-id' \
  --from-literal=GOOGLE_CLIENT_SECRET='your-google-client-secret' \
  --from-literal=API_URL='https://gurukulamhub.com/api' \
  --from-literal=NEXT_PUBLIC_API_URL='https://gurukulamhub.com/api' \
  --from-literal=REDIS_URL='redis://gurukulamhub-redis:6379' \
  --from-literal=RECAPTCHA_SECRET_KEY='your-recaptcha-secret' \
  --from-literal=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='your-stripe-pub-key' \
  --from-literal=NEXT_PUBLIC_STRIPE_SECRET_KEY='your-stripe-secret-key' \
  --from-literal=NEXT_PUBLIC_SOCKET_IO_SERVER='https://gurukulamhub.com' \
  --from-literal=SOCKET_SERVER_URL='https://gurukulamhub.com' \
  -n gurukulamhub
```

**Option B: Using YAML file**

```bash
# Copy template and edit
cp k8s/secret.yaml.template k8s/secret.yaml
# Edit k8s/secret.yaml with your values
kubectl apply -f k8s/secret.yaml
```

### Step 4: Deploy Redis

```bash
kubectl apply -f k8s/redis-deployment.yaml

# Verify Redis is running
kubectl get pods -n gurukulamhub
kubectl logs -f deployment/gurukulamhub-redis -n gurukulamhub
```

### Step 5: Deploy Application

**Important:** Update `k8s/deployment.yaml` with your image name:

```yaml
# If using local image:
image: gurukulamhub-app:latest
imagePullPolicy: IfNotPresent

# If using registry:
image: your-registry.com/gurukulamhub-app:latest
imagePullPolicy: Always
```

```bash
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get deployments -n gurukulamhub
kubectl get pods -n gurukulamhub
```

### Step 6: Create Service

```bash
kubectl apply -f k8s/service.yaml

# Verify service
kubectl get svc -n gurukulamhub
```

### Step 7: Install Ingress Controller (If not already installed)

**For Nginx Ingress:**

```bash
# Using Helm (recommended)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Or using kubectl
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

**For Traefik:**

```bash
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml
```

### Step 8: Deploy Ingress

```bash
kubectl apply -f k8s/ingress.yaml

# Check ingress
kubectl get ingress -n gurukulamhub
```

### Step 9: Get Ingress IP/Address

```bash
# For LoadBalancer type
kubectl get ingress -n gurukulamhub

# For NodePort (local setup)
kubectl get nodes -o wide
# Use node IP with NodePort
```

---

## Part 3: DNS Configuration

To access your application via `gurukulamhub.com`:

### Option 1: Local DNS (for local network access)

**On Windows (hosts file):**
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add: `<your-server-ip> gurukulamhub.com www.gurukulamhub.com`

**On Linux/Mac:**
```bash
sudo nano /etc/hosts
# Add: <your-server-ip> gurukulamhub.com www.gurukulamhub.com
```

**On other devices:**
- Configure your router's DNS or use a local DNS server
- Point `gurukulamhub.com` to your server's IP

### Option 2: Public DNS (for internet access)

1. **Get your server's public IP:**
   ```bash
   curl ifconfig.me
   ```

2. **Configure DNS records:**
   - Go to your domain registrar (where you bought gurukulamhub.com)
   - Add A records:
     - `gurukulamhub.com` → `<your-server-ip>`
     - `www.gurukulamhub.com` → `<your-server-ip>`

3. **Wait for DNS propagation** (can take 5 minutes to 48 hours)

---

## Part 4: SSL/TLS Setup

### Option 1: Let's Encrypt with Cert-Manager (Recommended)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Update ingress.yaml to use cert-manager
# Add these annotations:
# cert-manager.io/cluster-issuer: "letsencrypt-prod"
# Uncomment the tls section in ingress.yaml
```

### Option 2: Manual Certificate

1. Generate or obtain SSL certificates
2. Create Kubernetes secret:
   ```bash
   kubectl create secret tls gurukulamhub-tls \
     --cert=path/to/cert.crt \
     --key=path/to/cert.key \
     -n gurukulamhub
   ```
3. Uncomment TLS section in `k8s/ingress.yaml`

---

## Part 5: Verification & Testing

### Check All Resources

```bash
# Check all resources in namespace
kubectl get all -n gurukulamhub

# Check pods
kubectl get pods -n gurukulamhub

# Check logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Check ingress
kubectl describe ingress gurukulamhub-ingress -n gurukulamhub
```

### Test Application

```bash
# Port forward for testing (bypass ingress)
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub

# Access via browser
# http://localhost:3000
```

### Health Check

```bash
# Test health endpoint
curl http://gurukulamhub.com/api/health

# Or via port-forward
curl http://localhost:3000/api/health
```

---

## Part 6: Scaling & Updates

### Scale Deployment

```bash
# Scale to 3 replicas
kubectl scale deployment gurukulamhub-app --replicas=3 -n gurukulamhub
```

### Update Application

```bash
# Build new image
docker build -t gurukulamhub-app:v1.1.0 .

# Update deployment
kubectl set image deployment/gurukulamhub-app \
  app=gurukulamhub-app:v1.1.0 \
  -n gurukulamhub

# Or use rolling update
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub
```

### Rollback

```bash
# Check rollout history
kubectl rollout history deployment/gurukulamhub-app -n gurukulamhub

# Rollback to previous version
kubectl rollout undo deployment/gurukulamhub-app -n gurukulamhub
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n gurukulamhub

# Check logs
kubectl logs <pod-name> -n gurukulamhub

# Check events
kubectl get events -n gurukulamhub --sort-by='.lastTimestamp'
```

### Application Not Accessible

1. **Check Ingress:**
   ```bash
   kubectl get ingress -n gurukulamhub
   kubectl describe ingress gurukulamhub-ingress -n gurukulamhub
   ```

2. **Check Service:**
   ```bash
   kubectl get svc -n gurukulamhub
   kubectl describe svc gurukulamhub-app -n gurukulamhub
   ```

3. **Check DNS:**
   ```bash
   nslookup gurukulamhub.com
   dig gurukulamhub.com
   ```

### Database Connection Issues

- Verify `DATABASE_URL` in secrets
- Check MongoDB network access
- Verify firewall rules

### Redis Connection Issues

```bash
# Check Redis pod
kubectl logs deployment/gurukulamhub-redis -n gurukulamhub

# Test Redis connection
kubectl exec -it deployment/gurukulamhub-redis -n gurukulamhub -- redis-cli ping
```

### Image Pull Errors

- For local setup, ensure `imagePullPolicy: IfNotPresent`
- For registry, verify credentials and image exists

---

## Quick Reference Commands

```bash
# View all resources
kubectl get all -n gurukulamhub

# View logs
kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub

# Execute command in pod
kubectl exec -it <pod-name> -n gurukulamhub -- sh

# Delete everything
kubectl delete namespace gurukulamhub

# Restart deployment
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub
```

---

## Security Best Practices

1. **Never commit secrets** - Use Kubernetes Secrets
2. **Use RBAC** - Restrict access to namespace
3. **Enable network policies** - Restrict pod-to-pod communication
4. **Use TLS/SSL** - Always use HTTPS in production
5. **Regular updates** - Keep images and dependencies updated
6. **Resource limits** - Set appropriate CPU/memory limits
7. **Health checks** - Implement proper liveness/readiness probes

---

## Next Steps

1. Set up monitoring (Prometheus, Grafana)
2. Configure logging (ELK stack, Loki)
3. Set up CI/CD pipeline
4. Configure backup strategy for Redis and databases
5. Set up alerting

---

## Support

For issues or questions:
- Check application logs: `kubectl logs -f deployment/gurukulamhub-app -n gurukulamhub`
- Check Kubernetes events: `kubectl get events -n gurukulamhub`
- Review this guide's troubleshooting section

