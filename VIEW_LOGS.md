# Viewing Kubernetes Pod Logs

Quick reference guide for viewing logs from your Kubernetes deployment.

## View Logs from All Pods

```bash
# View logs from all pods matching the app label
kubectl logs -l app=gurukulamhub-app -n gurukulamhub

# View logs with timestamps
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --timestamps

# View last 50 lines from all pods
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --tail=50

# Follow logs in real-time (like tail -f)
kubectl logs -l app=gurukulamhub-app -n gurukulamhub -f
```

## View Logs from a Specific Pod

```bash
# First, get the pod name
kubectl get pods -n gurukulamhub

# View logs from specific pod
kubectl logs <pod-name> -n gurukulamhub

# Example:
kubectl logs gurukulamhub-app-6f9b968bcd-8fdkh -n gurukulamhub

# View last 100 lines
kubectl logs <pod-name> -n gurukulamhub --tail=100

# Follow logs in real-time
kubectl logs <pod-name> -n gurukulamhub -f

# View logs with timestamps
kubectl logs <pod-name> -n gurukulamhub --timestamps

# View logs from previous container (if pod restarted)
kubectl logs <pod-name> -n gurukulamhub --previous
```

## View Logs from All Containers in a Pod

```bash
# If a pod has multiple containers
kubectl logs <pod-name> -n gurukulamhub --all-containers=true
```

## View Logs Since a Specific Time

```bash
# View logs since last 10 minutes
kubectl logs <pod-name> -n gurukulamhub --since=10m

# View logs since last hour
kubectl logs <pod-name> -n gurukulamhub --since=1h

# View logs since a specific time
kubectl logs <pod-name> -n gurukulamhub --since-time='2025-12-27T10:00:00Z'
```

## Filter Logs (using grep/Select-String)

**PowerShell:**
```powershell
# Filter logs for errors
kubectl logs -l app=gurukulamhub-app -n gurukulamhub | Select-String "error" -CaseSensitive

# Filter logs for specific text
kubectl logs -l app=gurukulamhub-app -n gurukulamhub | Select-String "database"
```

**Linux/WSL:**
```bash
# Filter logs for errors
kubectl logs -l app=gurukulamhub-app -n gurukulamhub | grep -i error

# Filter logs for specific text
kubectl logs -l app=gurukulamhub-app -n gurukulamhub | grep "database"
```

## Most Common Commands

```bash
# 1. View recent logs from all pods (most common)
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --tail=100

# 2. Follow logs in real-time (like tail -f)
kubectl logs -l app=gurukulamhub-app -n gurukulamhub -f

# 3. View logs from a specific pod with timestamps
kubectl logs <pod-name> -n gurukulamhub --tail=50 --timestamps
```

## Example Workflow

```bash
# Step 1: List all pods to see their status
kubectl get pods -n gurukulamhub

# Step 2: View logs from a specific pod
kubectl logs gurukulamhub-app-6f9b968bcd-8fdkh -n gurukulamhub --tail=50

# Step 3: If you want to follow logs in real-time
kubectl logs gurukulamhub-app-6f9b968bcd-8fdkh -n gurukulamhub -f
```

## View Logs from Multiple Pods (One at a Time)

If you have multiple pods and want to see logs from each:

```bash
# View logs from first pod
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --tail=50 | head -100

# View logs from all pods, prefix with pod name
kubectl logs -l app=gurukulamhub-app -n gurukulamhub --tail=50 --prefix=true
```

## Troubleshooting

### Pod not found or not running
```bash
# Check pod status first
kubectl get pods -n gurukulamhub

# If pod is not running, check events
kubectl describe pod <pod-name> -n gurukulamhub
```

### No logs showing
```bash
# Check if pod is in Running state
kubectl get pods -n gurukulamhub

# Check pod events for issues
kubectl describe pod <pod-name> -n gurukulamhub

# View previous container logs if pod crashed
kubectl logs <pod-name> -n gurukulamhub --previous
```

### View logs from previous crashed container
```bash
kubectl logs <pod-name> -n gurukulamhub --previous
```

