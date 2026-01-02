# Docker Daemon Connection Error - Fix Guide

## Error: "rpc error: code = Unavailable desc = error reading from server: EOF"

This error indicates Docker Desktop lost connection or crashed during the build.

## Quick Fixes

### Solution 1: Restart Docker Desktop (Most Common Fix)

1. **Close Docker Desktop completely**
   - Right-click Docker icon in system tray
   - Click "Quit Docker Desktop"
   - Wait for it to fully close

2. **Restart Docker Desktop**
   - Open Docker Desktop from Start Menu
   - Wait for it to fully start (whale icon should be steady)

3. **Verify Docker is running**
   ```powershell
   docker ps
   ```
   Should show running containers (or empty list, not an error)

4. **Try building again**
   ```powershell
   docker build -t gurukulamhub-app:latest .
   ```

### Solution 2: Increase Docker Resources

If builds keep failing, Docker might be running out of resources:

1. **Open Docker Desktop Settings**
2. **Go to Resources**
3. **Increase:**
   - Memory: At least 4GB (8GB recommended)
   - CPUs: At least 2 cores
   - Disk: At least 20GB free

### Solution 3: Build in Stages (If Full Build Keeps Failing)

Build the image in stages to avoid long-running builds:

```powershell
# Build dependencies stage first
docker build --target deps -t gurukulamhub-app:deps .

# Then build the full image (will use cached deps)
docker build -t gurukulamhub-app:latest .
```

### Solution 4: Use BuildKit with Better Error Handling

```powershell
# Enable BuildKit
$env:DOCKER_BUILDKIT=1

# Build with progress output
docker build --progress=plain -t gurukulamhub-app:latest .
```

### Solution 5: Clean Docker and Rebuild

If Docker is corrupted:

```powershell
# Clean Docker system
docker system prune -a

# Remove all images
docker rmi $(docker images -q)

# Restart Docker Desktop, then rebuild
docker build -t gurukulamhub-app:latest .
```

### Solution 6: Check Docker Desktop Logs

If issues persist:

1. Open Docker Desktop
2. Go to Troubleshoot
3. Check logs for errors
4. Try "Restart Docker Desktop" from Troubleshoot menu

## Prevention Tips

1. **Don't interrupt builds** - Let them complete
2. **Close other heavy applications** during build
3. **Ensure stable internet** connection
4. **Use BuildKit** for better caching and reliability
5. **Build during off-peak hours** if network is slow

## Alternative: Build on Linux/WSL2

If Docker Desktop keeps having issues on Windows:

```powershell
# Use WSL2 with Docker
wsl --install
# Then install Docker in WSL2
```

## Next Steps After Fix

Once Docker is working:

1. **Verify Docker is running:**
   ```powershell
   docker --version
   docker ps
   ```

2. **Try building again:**
   ```powershell
   docker build -t gurukulamhub-app:latest .
   ```

3. **If build succeeds, verify image:**
   ```powershell
   docker images | grep gurukulamhub
   ```




