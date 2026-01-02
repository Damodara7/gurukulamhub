# Docker Build Troubleshooting Tips

## Issue: npm Timeout During Build

If you encounter `npm error Idle timeout reached for host registry.npmjs.org:443`, try these solutions:

### Solution 1: Use Updated Dockerfile (Already Applied)

The Dockerfile has been updated with:
- Increased timeout settings
- Retry logic
- Fallback to `npm install` if `npm ci` fails

### Solution 2: Build with Network Mode

```bash
# Build with host network (faster, but less secure)
docker build --network=host -t gurukulamhub-app:latest .
```

### Solution 3: Use Docker BuildKit with Cache

```bash
# Enable BuildKit for better caching
$env:DOCKER_BUILDKIT=1
docker build -t gurukulamhub-app:latest .
```

### Solution 4: Build in Stages

If the build keeps failing, build in stages:

```bash
# Build deps stage only
docker build --target deps -t gurukulamhub-app:deps .

# Then build the rest
docker build -t gurukulamhub-app:latest .
```

### Solution 5: Use npm Registry Mirror (If in region with slow npm)

```bash
# Build with custom registry
docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com -t gurukulamhub-app:latest .
```

Then update Dockerfile to accept the build arg:
```dockerfile
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry ${NPM_REGISTRY}
```

### Solution 6: Pre-install Dependencies Locally

```bash
# Install dependencies locally first
npm install --legacy-peer-deps

# Then build (Docker will use local node_modules if available)
docker build -t gurukulamhub-app:latest .
```

### Solution 7: Use .dockerignore to Exclude node_modules

Make sure `.dockerignore` excludes `node_modules` to avoid copying large directories.

## Common Build Issues

### Issue: "Cannot find module" errors
**Solution:** Ensure all dependencies are in package.json

### Issue: Build takes too long
**Solution:** 
- Use multi-stage builds (already implemented)
- Enable BuildKit caching
- Use `.dockerignore` to exclude unnecessary files

### Issue: Out of memory during build
**Solution:**
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or build with less parallelism
docker build --build-arg NODE_OPTIONS="--max-old-space-size=4096" -t gurukulamhub-app:latest .
```

## Recommended Build Command

```bash
# Best practice: Use BuildKit with cache
$env:DOCKER_BUILDKIT=1
docker build --progress=plain -t gurukulamhub-app:latest .
```

## Check Build Progress

```bash
# Build with verbose output
docker build --progress=plain --no-cache -t gurukulamhub-app:latest .
```

## Verify Image After Build

```bash
# Check image was created
docker images | grep gurukulamhub

# Test the image
docker run -p 3000:3000 gurukulamhub-app:latest
```

