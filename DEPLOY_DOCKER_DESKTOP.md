# Deploy to Docker Desktop Kubernetes

This guide shows how to deploy your Next.js app to Docker Desktop's built-in Kubernetes instead of Minikube.

## Prerequisites

- Docker Desktop installed and running
- Kubernetes enabled in Docker Desktop

## Step 1: Stop Minikube

```bash
# Stop Minikube
minikube stop

# (Optional) Delete Minikube cluster if you want to free up resources
# minikube delete
```

## Step 2: Enable Kubernetes in Docker Desktop

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Click **Kubernetes** in the left sidebar
4. Check **"Enable Kubernetes"**
5. Click **"Apply & Restart"**
6. Wait for Kubernetes to start (you'll see a green indicator when ready)

## Step 3: Switch kubectl Context to Docker Desktop

```bash
# List available contexts
kubectl config get-contexts

# Switch to Docker Desktop context (usually named "docker-desktop")
kubectl config use-context docker-desktop

# Verify you're connected to Docker Desktop
kubectl cluster-info
```

You should see output like:
```
Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

## Step 4: Build Docker Image

Since Docker Desktop uses the same Docker daemon, you don't need to load images separately (unlike Minikube):

```bash
# Build the image (this will be available to Kubernetes automatically)
docker build -t gurukulamhub-app:latest .
```

## Step 5: Create Namespace

```bash
# Create the namespace
kubectl apply -f k8s/namespace.yaml
```

## Step 6: Deploy ConfigMap

```bash
# For development (all env vars in ConfigMap)
kubectl apply -f k8s/configmap-all.yaml

# OR for production (separate ConfigMap + Secrets)
# kubectl apply -f k8s/configmap.yaml
# kubectl create secret generic gurukulamhub-secrets \
#   --from-literal=DATABASE_URL='your-database-url' \
#   ... (add other secrets)
```

## Step 7: Deploy Application

```bash
# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Deploy the service
kubectl apply -f k8s/service.yaml
```

## Step 8: Set Up Ingress (Optional)

Docker Desktop doesn't include an ingress controller by default. You have two options:

### Option A: Use Port Forwarding (Simple, for Development)

```bash
# Port forward to access the app locally
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub
```

Access the app at: `http://localhost:3000`

### Option B: Enable Ingress Controller (For gurukulamhub.com URL)

**Install NGINX Ingress Controller:**

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

**Update your hosts file** to map `gurukulamhub.com` to `localhost`:

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 gurukulamhub.com
127.0.0.1 www.gurukulamhub.com
```

**Linux/Mac** (`/etc/hosts`):
```
127.0.0.1 gurukulamhub.com
127.0.0.1 www.gurukulamhub.com
```

**Deploy Ingress:**
```bash
kubectl apply -f k8s/ingress.yaml
```

Access the app at: `http://gurukulamhub.com`

## Step 9: Verify Deployment

```bash
# Check pods
kubectl get pods -n gurukulamhub

# Check services
kubectl get svc -n gurukulamhub

# Check ingress (if installed)
kubectl get ingress -n gurukulamhub

# View logs
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --tail=50
```

## Key Differences from Minikube

| Feature | Minikube | Docker Desktop |
|---------|----------|----------------|
| **Docker Image** | Need `eval $(minikube docker-env)` | Same Docker daemon |
| **Image Building** | Build after setting docker-env | Build normally |
| **Ingress** | Usually pre-installed | Need to install manually |
| **Access Method** | `minikube service` or ingress | Port forward or ingress |

## Troubleshooting

### Pods stuck in ImagePullBackOff

If pods can't pull the image, make sure you built it:
```bash
docker images | grep gurukulamhub-app
```

If the image exists, the pods should find it automatically in Docker Desktop.

### Ingress not working

1. Check if ingress controller is running:
   ```bash
   kubectl get pods -n ingress-nginx
   ```

2. Check ingress status:
   ```bash
   kubectl describe ingress gurukulamhub-ingress -n gurukulamhub
   ```

### Can't access the app

- Use port forwarding: `kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub`
- Check service: `kubectl get svc -n gurukulamhub`
- Check pods are running: `kubectl get pods -n gurukulamhub`

## Quick Commands Reference

```bash
# Switch to Docker Desktop context
kubectl config use-context docker-desktop

# Delete everything
kubectl delete namespace gurukulamhub

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s

# Build image
docker build -t gurukulamhub-app:latest .

# Deploy everything
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap-all.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml


kubectl get ingress -n gurukulamhub
# NAME                   CLASS   HOSTS                                   ADDRESS     PORTS   AGE
# gurukulamhub-ingress   nginx   gurukulamhub.com,www.gurukulamhub.com   localhost   80      3m33s

kubectl get svc -n ingress-nginx
# NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
# ingress-nginx-controller             LoadBalancer   10.106.90.196    localhost     80:32158/TCP,443:30311/TCP   2d
# ingress-nginx-controller-admission   ClusterIP      10.107.191.155   <none>        443/TCP                      2d

# Port forward for local access 
# ❌ NO NEED to run this now, as we are using another WAY - (`C:\Windows\System32\drivers\etc\hosts` --> 127.0.0.1 www.gurukulamhub.com)
kubectl port-forward svc/gurukulamhub-app 3000:80 -n gurukulamhub

# View logs
kubectl logs -l app=gurukulamhub-app -n gurukulamhub -f

# Restart deployment
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub

# Delete everything
kubectl delete namespace gurukulamhub


# TYPE ✅ thisisunsafe ✅ in brower (gurukulamhub.com --> `C:\Windows\System32\drivers\etc\hosts` --> 127.0.0.1 www.gurukulamhub.com)
```

