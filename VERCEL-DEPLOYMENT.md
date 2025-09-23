# Deploy GurukulamHub to Vercel (Free)

Vercel is the company behind Next.js and offers the best Next.js hosting experience.

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Import your repository**: `Damodara7/gurukulamhub`
5. **Vercel will automatically detect** it's a Next.js app

### Step 3: Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
DATABASE_URL=file:./dev.db
REDIS_URL=redis://localhost:6379
NODE_ENV=production
API_BASE_URL=https://your-app-name.vercel.app/api
```

### Step 4: Vercel Will Automatically

- ✅ **Install dependencies** (`npm install`)
- ✅ **Build your app** (`npm run build`)
- ✅ **Deploy your app** with global CDN
- ✅ **Provide a URL** like `https://gurukulamhub.vercel.app`

## 🔧 Vercel-Specific Configuration

### Update next.config.mjs for Vercel

Your current `next.config.mjs` should work, but you can optimize it:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 180,
  transpilePackages: ['mui-file-input'],
  images: {
    domains: ['squizme-quiz.s3.ap-south-1.amazonaws.com']
  },
  // Vercel optimizations
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}
export default nextConfig
```

### Environment Variables for Vercel

Vercel will automatically use environment variables from the dashboard:

```bash
# Vercel Environment Variables
NEXTAUTH_URL=https://gurukulamhub.vercel.app
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
DATABASE_URL=file:./dev.db
REDIS_URL=redis://localhost:6379
NODE_ENV=production
API_BASE_URL=https://gurukulamhub.vercel.app/api
```

## 🎯 Vercel Advantages

- ✅ **Free tier**: Generous limits
- ✅ **Built for Next.js**: Zero configuration
- ✅ **Automatic deployments**: On every git push
- ✅ **Global CDN**: Edge network worldwide
- ✅ **SSL certificates**: Automatic HTTPS
- ✅ **Custom domains**: Free subdomain
- ✅ **Serverless functions**: For API routes
- ✅ **Analytics**: Built-in performance monitoring

## 📋 Vercel Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository imported
- [ ] Environment variables set
- [ ] App deployed successfully
- [ ] Custom domain configured (optional)

## 🌐 Your App Will Be Available At

After deployment: `https://gurukulamhub.vercel.app`

## 🔄 Automatic Updates

Every time you push to GitHub:
1. Vercel detects changes
2. Automatically rebuilds your app
3. Deploys to global CDN
4. Your app is updated instantly!

## 💡 Pro Tips

1. **Preview deployments**: Every PR gets a preview URL
2. **Custom domain**: Add your own domain in Vercel settings
3. **Environment variables**: Set them per environment (dev/prod)
4. **Analytics**: Enable Vercel Analytics for performance insights
5. **Edge functions**: Use for API routes if needed

## 🚨 Important Notes

- **Express server**: Vercel uses serverless functions, so your `next-node-express-server.mjs` might need adjustment
- **Redis**: Consider using Vercel's Redis addon or external service
- **Database**: SQLite works for development, consider PostgreSQL for production

---

**Vercel is the best platform for Next.js applications!** 🚀
