# Vercel Environment Variables

Copy these environment variables to your Vercel dashboard → Settings → Environment Variables:

## Required Environment Variables

```bash
NEXTAUTH_URL=https://gurukulamhub.vercel.app
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
DATABASE_URL=mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
API_BASE_URL=https://gurukulamhub.vercel.app/api
```

## Stripe Configuration

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OZar7SBB7wnYOSIs4gZrZqWeEJFlGlKP0KUREQBdJFn4TytYos3hfNb7XSTDeEjZmC0oaNOzZL4MeFrE34SrkXF00rWrNG7Yh
STRIPE_SECRET_KEY=sk_test_51OZar7SBB7wnYOSIxgxrydQim2M1f1oVPg6ty5yiU7McIYKM1qCwj7fDibjlXCqOps8xMZsDIk686MqiDDh3TsF500xWdlk6VD
STRIPE_WEBHOOK_SECRET=whsec_7e58bb3bbfef88f65591b5bbbb2e931b3cccf8f906edb012ea8a4aeff3fc2586
```

## Google OAuth

```bash
GOOGLE_CLIENT_ID=872140549132-k3ndunp63cl0j05mmi9uh1bctrt0pla9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## reCAPTCHA

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdybtIrAAAAAB1ZeuTJ-m-okYqu4tN2YN2Fkjms
RECAPTCHA_SECRET_KEY=6LdybtIrAAAAAODGKuB-bcesbOlM_qsd1V7SXmEA
```

## Socket.IO (if needed)

```bash
NEXT_PUBLIC_SOCKET_IO_SERVER=https://gurukulamhub.vercel.app
SOCKET_SERVER_URL=https://gurukulamhub.vercel.app
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable with its value
6. Make sure to select **Production** environment
7. Click **Save**

## Important Notes

- **STRIPE_SECRET_KEY** should NOT be public (no NEXT_PUBLIC_ prefix)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** is safe to be public
- Make sure all URLs use **https://** for production
- Update **NEXTAUTH_URL** to match your actual Vercel URL
