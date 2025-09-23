# Deploy GurukulamHub to Railway (Free)

Railway is perfect for your Next.js application and offers a generous free tier.

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

### Step 2: Deploy to Railway

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `Damodara7/gurukulamhub`
6. **Railway will automatically detect** it's a Next.js app

### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
DATABASE_URL=mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0
REDIS_URL=redis://localhost:6379
NODE_ENV=production
API_BASE_URL=https://gurukulamhub.up.railway.app/api
```

### Step 4: Railway Will Automatically

- ✅ **Install dependencies** (`npm install`)
- ✅ **Build your app** (`npm run build`)
- ✅ **Start your app** (`npm start`)
- ✅ **Provide a URL** like `https://gurukulamhub.up.railway.app`

## 🔧 Railway-Specific Configuration

### Update package.json for Railway

Railway needs a specific start script. Update your `package.json`:

```json
{
  "scripts": {
    "start": "node next-node-express-server.mjs",
    "build": "next build"
  }
}
```

### Environment Variables for Railway

Create a `.env` file for Railway (Railway will use these):

```bash
# Railway Environment Variables
NEXTAUTH_URL=https://gurukulamhub.up.railway.app
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
DATABASE_URL=mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0
REDIS_URL=redis://localhost:6379
NODE_ENV=production
API_BASE_URL=https://gurukulamhub.up.railway.app/api
PORT=3000
```

## 🎯 Railway Advantages

- ✅ **Free tier**: $5 credit monthly
- ✅ **Automatic deployments**: On every git push
- ✅ **Zero configuration**: Works out of the box
- ✅ **Custom domains**: Free subdomain
- ✅ **SSL certificates**: Automatic HTTPS
- ✅ **Global CDN**: Fast worldwide
- ✅ **Database support**: PostgreSQL, Redis available

## 📋 Railway Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] App deployed successfully
- [ ] Custom domain configured (optional)

## 🌐 Your App Will Be Available At

After deployment: `https://gurukulamhub.up.railway.app`

## 🔄 Automatic Updates

Every time you push to GitHub:
1. Railway detects changes
2. Automatically rebuilds your app
3. Deploys the new version
4. Your app is updated instantly!

## 💡 Pro Tips

1. **Monitor usage**: Check Railway dashboard for resource usage
2. **Custom domain**: Add your own domain in Railway settings
3. **Environment variables**: Update them in Railway dashboard
4. **Logs**: View real-time logs in Railway dashboard

---

**Railway is the easiest way to deploy your GurukulamHub for free!** 🚀
