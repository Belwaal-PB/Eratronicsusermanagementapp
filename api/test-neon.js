// Test script for Neon database connection
import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const client = createClient();
  
  try {
    await client.connect();
    
    // Test basic connection
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    res.status(200).json({
      success: true,
      message: 'Neon database connection successful!',
      data: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version,
        environment: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL
        }
      }
    });

  } catch (error) {
    console.error('Neon connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Neon database',
      error: error.message,
      environment: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  } finally {
    await client.end();
  }
}
