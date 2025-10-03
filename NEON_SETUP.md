# Neon Database Setup Guide

This guide will help you set up your Eratronics Selectit app with Neon database on Vercel.

## Step 1: Set Environment Variables in Vercel

1. Go to your **Vercel Dashboard**
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Variables:
```
POSTGRES_URL = postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER = neondb_owner
POSTGRES_PASSWORD = npg_WQs9mX5AMNhz
POSTGRES_DATABASE = neondb
POSTGRES_HOST = ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech
```

### Optional Variables (for advanced usage):
```
DATABASE_URL = postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING = postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Step 2: Test Connection

After setting environment variables, test the connection:

```bash
curl https://your-app-name.vercel.app/api/test-neon
```

You should see a response like:
```json
{
  "success": true,
  "message": "Neon database connection successful!",
  "data": {
    "currentTime": "2024-01-15T10:30:00.000Z",
    "postgresVersion": "PostgreSQL 15.4",
    "environment": {
      "hasPostgresUrl": true,
      "hasDatabaseUrl": true
    }
  }
}
```

## Step 3: Initialize Database

Once the connection works, initialize your database:

```bash
curl -X POST https://your-app-name.vercel.app/api/init-db
```

This will create all necessary tables and insert default data.

## Step 4: Test Your App

1. Visit your app URL
2. Try logging in with:
   - **Admin**: `admin` / `admin123`
   - **User A**: `user_a` / `passworda`
   - **User B**: `user_b` / `passwordb`
   - **User C**: `user_c` / `passwordc`

## Database Schema

Your Neon database will have these tables:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('admin', 'a', 'b', 'c')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Images Table
```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('basic', 'intermediate', 'advanced')),
  image_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Clicks Table
```sql
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly in Vercel
- Check that your Neon database is active
- Ensure SSL mode is set to `require`

### Database Not Found
- Make sure you're using the correct database name (`neondb`)
- Verify the connection string includes the database name

### Permission Issues
- Ensure the user has proper permissions in Neon
- Check that the connection string uses the correct credentials

## Benefits of Neon

✅ **Serverless**: Scales automatically with your app
✅ **Fast**: Optimized for serverless functions
✅ **Reliable**: Built on PostgreSQL with high availability
✅ **Global**: Edge locations for low latency
✅ **Cost-effective**: Pay only for what you use

## Local Development

For local development, create a `.env.local` file:

```env
POSTGRES_URL=postgresql://neondb_owner:npg_WQs9mX5AMNhz@ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_WQs9mX5AMNhz
POSTGRES_DATABASE=neondb
POSTGRES_HOST=ep-green-cherry-adrgm3qy-pooler.c-2.us-east-1.aws.neon.tech
```

Then run:
```bash
vercel dev
```

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Test the connection with `/api/test-neon`
3. Verify environment variables in Vercel dashboard
4. Check Neon dashboard for database status

Your app is now ready to use with Neon database! 🚀
