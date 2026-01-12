# Security Notes - ConfigMap vs Secrets

## Overview

This document explains which environment variables should be stored in **ConfigMap** vs **Secrets** in Kubernetes.

## General Rules

### ConfigMap (Non-sensitive data)
- Public keys and IDs meant for client-side use
- Environment names (development, production)
- Port numbers
- Public URLs (though URLs can also be in Secrets for flexibility)

### Secrets (Sensitive data)
- **Passwords** (database passwords, Redis passwords)
- **Secret keys** (NEXTAUTH_SECRET, API secret keys)
- **OAuth secrets** (GOOGLE_CLIENT_SECRET)
- **Private keys** (even if prefixed with NEXT_PUBLIC_)
- **Connection strings with credentials** (DATABASE_URL with password)

## Variable Classification

### ✅ Safe for ConfigMap

| Variable | Type | Reason |
|----------|------|--------|
| `NODE_ENV` | Public | Environment identifier |
| `PORT` | Public | Port number |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public Key | Meant for client-side use |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Key | Meant for client-side use |
| `GOOGLE_CLIENT_ID` | Public ID | OAuth client ID (public) |

### 🔒 Must be in Secrets

| Variable | Type | Reason |
|----------|------|--------|
| `DATABASE_URL` | **SENSITIVE** | Contains database password |
| `NEXTAUTH_SECRET` | **SENSITIVE** | Secret key for session encryption |
| `GOOGLE_CLIENT_SECRET` | **SENSITIVE** | OAuth secret key |
| `RECAPTCHA_SECRET_KEY` | **SENSITIVE** | Server-side secret key |
| `NEXT_PUBLIC_STRIPE_SECRET_KEY` | **SENSITIVE** | Secret key (despite NEXT_PUBLIC prefix) |
| `REDIS_URL` | **SENSITIVE** | May contain password |

### ⚠️ Can be in Either (URLs)

These can be in ConfigMap or Secrets depending on your preference:

| Variable | Recommendation |
|----------|----------------|
| `NEXTAUTH_URL` | Secrets (varies by environment) |
| `API_URL` | Secrets (varies by environment) |
| `NEXT_PUBLIC_API_URL` | Secrets (varies by environment) |
| `NEXT_PUBLIC_SOCKET_IO_SERVER` | Secrets (varies by environment) |
| `SOCKET_SERVER_URL` | Secrets (varies by environment) |

**Recommendation**: Keep URLs in Secrets for flexibility across environments (dev, staging, prod).

## Important Notes

### NEXT_PUBLIC_ Prefix

Variables prefixed with `NEXT_PUBLIC_` are exposed to the client-side (browser). However:

- **Public keys** (like `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) are safe to expose
- **Secret keys** (like `NEXT_PUBLIC_STRIPE_SECRET_KEY`) should still be in Secrets
- Even though they're exposed to the client, secret keys should never be committed to version control

### Best Practices

1. **Never commit secrets** to git
2. **Use Secrets** for anything with passwords or private keys
3. **Use ConfigMap** only for truly public, non-sensitive data
4. **When in doubt**, use Secrets (it's safer)
5. **Rotate secrets** regularly in production

## Current Configuration

### ConfigMap (`k8s/configmap.yaml`)
- `NODE_ENV`
- `PORT`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

### Secrets (`k8s/secret.yaml.template`)
- All sensitive data (passwords, secrets, keys)
- URLs (for environment flexibility)

## Updating Secrets

To update secrets after deployment:

```bash
# Update a single secret
kubectl create secret generic gurukulamhub-secrets \
  --from-literal=NEW_SECRET='value' \
  --dry-run=client -o yaml | kubectl apply -f - -n gurukulamhub

# Or edit existing secret
kubectl edit secret gurukulamhub-secrets -n gurukulamhub

# Restart pods to pick up new secrets
kubectl rollout restart deployment/gurukulamhub-app -n gurukulamhub
```

## Security Checklist

- [ ] All passwords are in Secrets
- [ ] All secret keys are in Secrets
- [ ] No sensitive data in ConfigMap
- [ ] Secrets are not committed to git
- [ ] RBAC is configured to restrict access to Secrets
- [ ] Secrets are encrypted at rest (Kubernetes default)
- [ ] Regular secret rotation is planned

