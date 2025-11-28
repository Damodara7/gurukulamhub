# Seed Scripts

## SUPER_ADMIN Initialization

This directory contains seed scripts for initializing the application with essential data.

### SUPER_ADMIN Seed Script

The `seedSuperAdmin.js` script initializes:
1. **All Features** - Creates all features from `FEATURES_LOOKUP` with all permissions from `PERMISSIONS_LOOKUP`
2. **SUPER_ADMIN Role** - Creates the SUPER_ADMIN role with access to all features and all permissions
3. **SUPER_ADMIN User** - Creates the SUPER_ADMIN user with the email specified in environment variables

### Setup

1. **Set Environment Variable**
   Add to your `.env.local` file:
   ```env
   SUPER_ADMIN_EMAIL=your-super-admin@email.com
   ```

2. **Run the Seed Script**

   **Option A: Via API Route (Recommended - Works Best)**
   ```bash
   # Start your Next.js server first
   npm run dev
   
   # Then in another terminal, call the API route
   # In development
   curl http://localhost:3000/api/seed
   
   # In production (with secret token)
   curl "http://your-domain.com/api/seed?secret=YOUR_SEED_SECRET"
   ```
   
   **Why this is recommended**: The API route runs in Next.js context, so all imports and path aliases work correctly.

   **Option B: Via Node Script (Standalone - May Have Module Issues)**
   
   ⚠️ **Note**: Running directly with Node.js may fail due to ES module resolution issues in the model files. The API route (Option A) is strongly recommended.
   
   ```bash
   # Make sure you have .env.local file with SUPER_ADMIN_EMAIL and MONGODB_URI
   # The script uses ES modules, so you may need to:
   
   # Option 1: Use tsx (handles module resolution better)
   npx tsx src/scripts/seedSuperAdmin.js
   
   # Option 2: Use node directly (may fail due to missing .js extensions in models)
   node src/scripts/seedSuperAdmin.js
   ```
   
   **If you get module resolution errors**: This is because some model files import without `.js` extensions (which works in Next.js but not in standalone Node). Use Option A (API route) instead - it's the most reliable method.

   **Option C: Import in Application Startup**
   ```javascript
   import { initializeSuperAdmin } from '@/scripts/seedSuperAdmin'
   
   // Call during app initialization (e.g., in a startup hook)
   if (process.env.NODE_ENV === 'production') {
     initializeSuperAdmin().catch(console.error)
   }
   ```

### Important Notes

- **Idempotent**: The script is safe to run multiple times. It checks if SUPER_ADMIN already exists before creating.
- **One-Time Setup**: This should be run **ONCE** when deploying for the first time.
- **Password**: When creating a new SUPER_ADMIN user, a secure random password is generated and displayed in the console. **Save this password immediately** - it won't be shown again.
- **Security**: 
  - In production, protect the `/api/seed` route with a secret token (set `SEED_SECRET` in environment variables)
  - Change the SUPER_ADMIN password immediately after first login
  - Keep the SUPER_ADMIN email secure

### What Gets Created

1. **Features**: Initial features with their specific permissions (as defined in the seed script):
   - The script creates features only if they don't already exist
   - If a feature already exists, it preserves the current permissions (respects SUPER_ADMIN modifications)
   - Initial features include: HOME, PUBLIC_QUIZZES, MY_QUIZZES, MANAGE_USERS, ROLES_PERMISSIONS, etc.
   - Each feature has specific permissions (not all permissions) as per your database structure

2. **SUPER_ADMIN Role**: A role with:
   - Name: `SUPER_ADMIN`
   - All features with **ALL permissions** (SUPER_ADMIN gets full access to everything)
   - Active status
   - SUPER_ADMIN can modify, delete, or update any feature or permission

3. **SUPER_ADMIN User**: A user with:
   - Email: From `SUPER_ADMIN_EMAIL` environment variable
   - Role: `SUPER_ADMIN`
   - Admin privileges: `isAdmin: true`
   - Verified status: `isVerified: true`
   - Active status: `isActive: true`

### Important Behavior

- **Preserves Modifications**: If SUPER_ADMIN has modified features (added/deleted/updated permissions), those changes are preserved when the script runs
- **Only Creates Missing**: The script only creates features that don't exist
- **SUPER_ADMIN Access**: SUPER_ADMIN role gets ALL permissions for every feature, regardless of the feature's default permissions

### Troubleshooting

- **Error: SUPER_ADMIN_EMAIL not set**
  - Solution: Add `SUPER_ADMIN_EMAIL` to your `.env.local` file

- **Error: User already exists**
  - This is normal if the script has been run before. The script will update the existing user to ensure they have the SUPER_ADMIN role.

- **Error: MongoDB connection failed**
  - Ensure your `DATABASE_URL` or `MONGODB_URI` is correctly set in `.env.local`

### Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use strong passwords** for SUPER_ADMIN
3. **Limit access** to the seed API route in production
4. **Rotate credentials** periodically
5. **Monitor** SUPER_ADMIN account activity


