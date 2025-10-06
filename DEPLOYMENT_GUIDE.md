# Eratronics Selectit - Deployment Guide

## 🚀 Quick Fix for Vercel Deployment

This guide will help you fix the Vercel deployment error and get your app running.

## ❌ The Problem

You're getting this error on Vercel:
```
Cannot find module '/var/task/node_modules/@vercel/postgres/dist/index-node.cjs'
Did you forget to add it to "dependencies" in `package.json`?
```

## ✅ The Solution

I've fixed the following issues:

### 1. Fixed Package.json
- ✅ Removed `@vercel/kv` dependency (not needed)
- ✅ Updated Node.js version to 18.x
- ✅ Removed `"type": "module"` to use CommonJS
- ✅ Added proper build script

### 2. Fixed API Files
- ✅ Converted all API files from ES modules to CommonJS
- ✅ Changed `import` to `require()`
- ✅ Changed `export default` to `module.exports`

### 3. Updated Vercel Configuration
- ✅ Updated `vercel.json` to use Vercel v2 configuration
- ✅ Properly configured API routes and static files
- ✅ Set Node.js runtime to 18.x

### 4. Created Database Configuration
- ✅ Created `database-config.json` with Neon database credentials
- ✅ Includes all necessary connection strings

## 🛠️ Files Modified

1. **package.json** - Fixed dependencies and configuration
2. **vercel.json** - Updated to Vercel v2 format
3. **api/data.js** - Converted to CommonJS
4. **api/init-db.js** - Converted to CommonJS
5. **api/test-neon.js** - Converted to CommonJS
6. **api/migrate.js** - Converted to CommonJS
7. **database-config.json** - Added database credentials

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel
1. Push your changes to GitHub
2. Deploy to Vercel (or redeploy if already deployed)

### Step 2: Set Environment Variables
In your Vercel dashboard, go to Settings → Environment Variables and add:

```
POSTGRES_URL = postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER = neondb_owner
POSTGRES_PASSWORD = npg_WQs9mX5AMNhz
POSTGRES_DATABASE = neondb
POSTGRES_HOST = ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech
DATABASE_URL = postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Test Database Connection
After deployment, test the connection:
```bash
curl https://your-app-name.vercel.app/api/test-neon
```

### Step 4: Initialize Database
Initialize the database with default data:
```bash
curl -X POST https://your-app-name.vercel.app/api/init-db
```

### Step 5: Test the Application
Visit your app URL and try logging in with:
- **Admin**: `admin` / `admin123`
- **User A**: `user_a` / `passworda`
- **User B**: `user_b` / `passwordb`
- **User C**: `user_c` / `passwordc`

## 🔧 What Was Fixed

### Module Resolution Issue
The main problem was that Vercel couldn't find the `@vercel/postgres` module because:
1. The project was configured as ES modules but Vercel expected CommonJS
2. The `vercel.json` configuration was outdated
3. The API files were using ES module syntax

### Solution Applied
1. **Converted to CommonJS**: All API files now use `require()` and `module.exports`
2. **Updated Vercel Config**: Used Vercel v2 configuration format
3. **Fixed Dependencies**: Removed unnecessary dependencies and updated Node.js version
4. **Added Database Config**: Created configuration file with Neon database credentials

## 📋 Verification Checklist

- [ ] All API files use CommonJS (`require`/`module.exports`)
- [ ] `package.json` has correct dependencies
- [ ] `vercel.json` uses v2 configuration
- [ ] Environment variables are set in Vercel
- [ ] Database connection test passes
- [ ] Database initialization succeeds
- [ ] Application loads and login works

## 🆘 Troubleshooting

### If you still get module errors:
1. Check that all API files use `require('@vercel/postgres')`
2. Verify `package.json` doesn't have `"type": "module"`
3. Ensure `vercel.json` is properly formatted

### If database connection fails:
1. Verify environment variables in Vercel dashboard
2. Check that your Neon database is active
3. Test with `/api/test-neon` endpoint

### If the app doesn't load:
1. Check Vercel function logs
2. Verify all static files are in the `static/` directory
3. Test individual API endpoints

## 🎉 Success!

Once deployed successfully, your Eratronics Selectit app will be fully functional with:
- ✅ User authentication system
- ✅ Image selection interface
- ✅ Admin dashboard
- ✅ Database persistence
- ✅ Responsive design

The app supports three user types (A, B, C) with different image access levels and includes comprehensive admin functionality for user and image management.

---

**Need help?** Check the Vercel function logs or test individual API endpoints to diagnose any remaining issues.
