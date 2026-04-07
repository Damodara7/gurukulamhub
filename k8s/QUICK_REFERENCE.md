# Quick Reference - ConfigMap Options

## Two Ways to Deploy

### Option 1: Secure Setup (Production) ✅

**Use separate ConfigMap + Secrets:**

```bash
# 1. Create ConfigMap (non-sensitive)
kubectl apply -f k8s/configmap.yaml -n gurukulamhub

# 2. Create Secrets (sensitive data)
kubectl create secret generic gurukulamhub-secrets \
  --from-literal=DATABASE_URL='mongodb+srv://...' \
  --from-literal=NEXTAUTH_SECRET='...' \
  --from-literal=GOOGLE_CLIENT_SECRET='...' \
  --from-literal=RECAPTCHA_SECRET_KEY='...' \
  --from-literal=NEXT_PUBLIC_STRIPE_SECRET_KEY='...' \
  --from-literal=NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID='...' \
  --from-literal=NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET='...' \
  --from-literal=LLM_PROVIDER='gemini' \
  --from-literal=GEMINI_API_KEY='...' \
  --from-literal=OPENAI_API_KEY='...' \
  -n gurukulamhub

# 3. Deploy application
kubectl apply -f k8s/deployment.yaml -n gurukulamhub
```

**Pros:**
- ✅ Secure (encrypted at rest)
- ✅ Best practice
- ✅ Compliance ready

**Cons:**
- ❌ More steps
- ❌ Need to manage secrets separately

---

### Option 2: Convenience Setup (Development) ⚠️

**Use single ConfigMap with everything:**

```bash
# 1. Create ConfigMap with all values (including secrets)
kubectl apply -f k8s/configmap-all.yaml -n gurukulamhub

# 2. Update deployment to use only ConfigMap
# Edit k8s/deployment.yaml and change envFrom to:
#   envFrom:
#   - configMapRef:
#       name: gurukulamhub-config
# (Remove the secretRef section)

# 3. Deploy application
kubectl apply -f k8s/deployment.yaml -n gurukulamhub
```

**Pros:**
- ✅ Simple (one file)
- ✅ Easy to manage
- ✅ Good for development

**Cons:**
- ❌ Less secure (plain text in etcd)
- ❌ Not recommended for production
- ❌ Anyone with cluster access can read secrets

---

## Which Should You Use?

| Scenario | Recommendation |
|----------|----------------|
| **Production** | Option 1 (Secure) ✅ |
| **Staging** | Option 1 (Secure) ✅ |
| **Development** | Option 2 (Convenience) ⚠️ |
| **Testing** | Option 2 (Convenience) ⚠️ |
| **Local Kubernetes** | Option 2 (Convenience) ⚠️ |

## Quick Commands

### Check what's in ConfigMap:
```bash
kubectl get configmap gurukulamhub-config -n gurukulamhub -o yaml
```

### Check what's in Secrets:
```bash
kubectl get secret gurukulamhub-secrets -n gurukulamhub -o yaml
```

### Update ConfigMap:
```bash
kubectl edit configmap gurukulamhub-config -n gurukulamhub
```

### Update Secrets:
```bash
kubectl edit secret gurukulamhub-secrets -n gurukulamhub
```

### Restart pods after changes:
```bash
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub
```

## Environment Variables Included

All variables from your `.env` file are now available in:

- **`k8s/configmap-all.yaml`** - Everything (convenience)
- **`k8s/configmap.yaml`** - Non-sensitive only (secure)
- **`k8s/secret.yaml.template`** - Sensitive only (secure)

## Need Help?

- See `k8s/CONFIGMAP_VS_SECRETS.md` for detailed security comparison
- See `k8s/SECURITY_NOTES.md` for security best practices

