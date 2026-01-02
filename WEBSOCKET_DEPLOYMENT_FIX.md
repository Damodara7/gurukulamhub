# WebSocket Real-Time Messaging Fix for Kubernetes Deployment

## Problem

WebSocket messages work in development but not in deployment because:

1. **Ingress Missing WebSocket Headers**: NGINX Ingress Controller needs specific annotations to support WebSocket upgrade connections
2. **Multiple Pods Issue**: With multiple replicas, WebSocket connections can go to different pods, and the WebSocket state (`globalThis.__chatClientsByGroupId`) is **per-pod**, not shared across pods

### Why It Works in Development

- Single Next.js server instance
- All WebSocket connections go to the same server
- All clients share the same `globalThis.__chatClientsByGroupId` object

### Why It Fails in Deployment

- Multiple pod replicas (2 pods)
- User A connects to Pod 1 → stored in Pod 1's `globalThis.__chatClientsByGroupId`
- User B connects to Pod 2 → stored in Pod 2's `globalThis.__chatClientsByGroupId`
- When User A sends a message, it's only broadcasted to clients on Pod 1
- User B (on Pod 2) doesn't receive the message because they're on a different pod

## Fixes Applied

### 1. Ingress WebSocket Support ✅

Added WebSocket upgrade headers to `k8s/ingress.yaml`:

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
  nginx.ingress.kubernetes.io/websocket-services: "gurukulamhub-app"
  nginx.ingress.kubernetes.io/configuration-snippet: |
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
```

### 2. Session Affinity ✅

Improved session affinity in `k8s/service.yaml`:

```yaml
sessionAffinity: ClientIP
sessionAffinityConfig:
  clientIP:
    timeoutSeconds: 10800  # 3 hours
```

This ensures all requests from the same client go to the same pod.

### 3. Reduced Replicas to 1 ✅

Changed `k8s/deployment.yaml`:

```yaml
replicas: 1  # Set to 1 for WebSocket real-time messaging
```

**This is a quick fix** - all WebSocket connections will go to the same pod.

## Deploy the Fixes

```bash
# Apply updated Ingress
kubectl apply -f k8s/ingress.yaml

# Apply updated Service
kubectl apply -f k8s/service.yaml

# Apply updated Deployment
kubectl apply -f k8s/deployment.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub
```

## Long-Term Solution (For Multiple Replicas)

If you need multiple replicas for high availability, you need to share WebSocket state across pods using one of these approaches:

### Option A: Redis Pub/Sub (Recommended)

Use Redis to broadcast messages across all pods:

1. **Install Redis** (if not already installed):
   ```bash
   kubectl apply -f k8s/redis-deployment.yaml
   ```

2. **Modify WebSocket publishers** to use Redis pub/sub:
   - When a message is sent, publish it to Redis
   - All pods subscribe to Redis and broadcast to their local clients
   - This ensures all pods receive and broadcast messages

3. **Example implementation**:
   ```javascript
   // In publishers.js
   import redis from 'redis'
   
   const redisClient = redis.createClient({ url: process.env.REDIS_URL })
   
   export function broadcastGroupChatMessage(groupId, message) {
     // Broadcast to local clients
     const clients = chatClientsByGroupId[groupId]
     // ... existing code ...
     
     // Also publish to Redis for other pods
     redisClient.publish(`group-chat:${groupId}`, JSON.stringify({
       type: 'newMessage',
       data: message
     }))
   }
   
   // Subscribe to Redis in each pod
   redisClient.subscribe(`group-chat:*`, (message) => {
     const { groupId, data } = JSON.parse(message)
     // Broadcast to local clients
     broadcastToLocalClients(groupId, data)
   })
   ```

### Option B: Sticky Sessions (Current Approach)

- Keep `replicas: 1` for now
- Or use session affinity (already configured) - but this only works if users are on the same pod
- **Limitation**: Users on different pods still won't see each other's messages

### Option C: Single WebSocket Pod

- Create a separate deployment with 1 replica just for WebSocket connections
- Route WebSocket traffic to this pod
- Route regular HTTP traffic to multiple pods

## Verify WebSocket is Working

1. **Check Ingress annotations**:
   ```bash
   kubectl get ingress gurukulamhub-ingress -n gurukulamhub -o yaml | grep -A 10 annotations
   ```

2. **Check WebSocket connections in logs**:
   ```bash
   kubectl logs -l app=gurukulamhub-app -n gurukulamhub | grep -i "ws\|websocket\|connected"
   ```

3. **Test in browser**:
   - Open browser DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Open group chat
   - You should see WebSocket connection established
   - Send a message and verify it appears in real-time

## Troubleshooting

### WebSocket connection fails

1. **Check if Ingress controller supports WebSockets**:
   ```bash
   kubectl get ingressclass
   ```

2. **Check Ingress logs**:
   ```bash
   kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50
   ```

3. **Verify WebSocket upgrade headers**:
   ```bash
   kubectl describe ingress gurukulamhub-ingress -n gurukulamhub
   ```

### Messages not appearing in real-time

1. **Check if multiple pods are running**:
   ```bash
   kubectl get pods -n gurukulamhub
   ```

2. **Check WebSocket connections per pod**:
   ```bash
   kubectl logs <pod-name> -n gurukulamhub | grep "WS\|connected"
   ```

3. **If multiple pods, ensure session affinity is working**:
   - Check service configuration
   - Verify clients are going to the same pod

## Current Status

✅ **Fixed**: Ingress WebSocket headers added
✅ **Fixed**: Session affinity improved  
✅ **Fixed**: Replicas reduced to 1 (quick fix)

⚠️ **Note**: With `replicas: 1`, you lose high availability. For production with multiple replicas, implement Redis pub/sub solution.

