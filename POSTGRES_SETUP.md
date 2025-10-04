# Vercel Postgres Setup Guide

This guide will help you migrate your Eratronics Selectit app from KV storage to Vercel Postgres for persistent data storage.

## Prerequisites

- A Vercel account
- Your project already deployed on Vercel
- Vercel CLI installed (optional, for local development)

## Step 1: Create Postgres Database

1. Go to your Vercel Dashboard
2. Navigate to your project
3. Go to the **Storage** tab in the left sidebar
4. Click **Create Database** → **Postgres**
5. Choose a region closest to your users
6. Click **Create**

Vercel will automatically generate these environment variables:
- `POSTGRES_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 2: Initialize Database

After creating the database, you need to run the initialization script to create tables and insert default data.

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Run the database initialization:
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/init-db
   ```

### Option B: Using Vercel Dashboard

1. Go to your project's **Functions** tab
2. Find the `init-db` function
3. Click on it and then click **Invoke**
4. The function will create all necessary tables and insert default data

## Step 3: Verify Setup

1. Test the API endpoints:
   ```bash
   # Test getting all data
   curl https://your-app-name.vercel.app/api/data
   
   # Test login
   curl -X POST https://your-app-name.vercel.app/api/data/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. Check your app in the browser - it should work exactly as before, but now with persistent data storage.

## Default Credentials

The initialization script creates these default users:

| Username | Password | User Type | Access Level |
|----------|----------|-----------|--------------|
| admin | admin123 | admin | Full access to all features |
| user_a | passworda | a | Basic images only (7 images) |
| user_b | passwordb | b | Basic + Intermediate (14 images) |
| user_c | passwordc | c | All images (21 images) |

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(255) UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `user_type` (VARCHAR(50) CHECK: 'admin', 'a', 'b', 'c')
- `created_at` (TIMESTAMP DEFAULT NOW())

### Images Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255) NOT NULL)
- `filename` (VARCHAR(255) NOT NULL)
- `category` (VARCHAR(50) CHECK: 'basic', 'intermediate', 'advanced')
- `image_data` (TEXT) - For base64 encoded images
- `created_at` (TIMESTAMP DEFAULT NOW())

### Clicks Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- `image_id` (INTEGER REFERENCES images(id) ON DELETE CASCADE)
- `clicked_at` (TIMESTAMP DEFAULT NOW())

## Environment Variables

Make sure these environment variables are set in your Vercel project:

```
POSTGRES_URL=postgres://username:password@host:port/database
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database_name
```

These are automatically set when you create the Postgres database in Vercel.

## Migration from KV Storage

If you were previously using KV storage, the migration is seamless:

1. Your existing data structure remains the same
2. All API endpoints work identically
3. The frontend requires no changes
4. Data is now persistent and survives function cold starts

## Troubleshooting

### Database Connection Issues
- Verify environment variables are set correctly
- Check that the Postgres database is active in Vercel Dashboard
- Ensure your region selection is appropriate

### Initialization Fails
- Check the function logs in Vercel Dashboard
- Verify the database exists and is accessible
- Try running the init-db function again

### Data Not Persisting
- Ensure you're using the Postgres-based API endpoints
- Check that the database tables were created successfully
- Verify foreign key constraints are working

## Benefits of Postgres

✅ **Persistent Storage**: Data survives function restarts and deployments
✅ **ACID Compliance**: Reliable transactions and data integrity
✅ **Scalability**: Handles large datasets efficiently
✅ **Query Performance**: Optimized with indexes for fast lookups
✅ **Data Relationships**: Proper foreign keys and constraints
✅ **Backup & Recovery**: Automatic backups and point-in-time recovery

## Support

If you encounter any issues:

1. Check the Vercel function logs
2. Verify your environment variables
3. Test the API endpoints individually
4. Review the database schema in Vercel Dashboard

The migration should be seamless, and your app will continue to work exactly as before, but with the reliability and scalability of Postgres!
