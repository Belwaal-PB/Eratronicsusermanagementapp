// Database initialization script
// This script should be run once to set up the database tables and initial data
const { createClient } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const client = createClient();
  
  try {
    await client.connect();

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('admin', 'a', 'b', 'c')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('basic', 'intermediate', 'advanced')),
        image_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
        clicked_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clicks_user_id ON clicks(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clicks_image_id ON clicks(image_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
    `);

    // Hash password function
    function hashPassword(password) {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    }

    // Insert default admin user if it doesn't exist
    const adminExists = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (adminExists.rows.length === 0) {
      await client.query(
        'INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3)',
        ['admin', hashPassword('admin123'), 'admin']
      );
    }

    // Insert default sample users if they don't exist
    const sampleUsers = [
      { username: 'user_a', password: 'passworda', user_type: 'a' },
      { username: 'user_b', password: 'passwordb', user_type: 'b' },
      { username: 'user_c', password: 'passwordc', user_type: 'c' }
    ];

    for (const user of sampleUsers) {
      const userExists = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [user.username]
      );

      if (userExists.rows.length === 0) {
        await client.query(
          'INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3)',
          [user.username, hashPassword(user.password), user.user_type]
        );
      }
    }

    // Insert default images if they don't exist
    const defaultImages = [
      // Basic images (7)
      { name: 'Nature 1', filename: 'basic1.jpg', category: 'basic' },
      { name: 'Nature 2', filename: 'basic2.jpg', category: 'basic' },
      { name: 'Nature 3', filename: 'basic3.jpg', category: 'basic' },
      { name: 'Nature 4', filename: 'basic4.jpg', category: 'basic' },
      { name: 'Nature 5', filename: 'basic5.jpg', category: 'basic' },
      { name: 'Nature 6', filename: 'basic6.jpg', category: 'basic' },
      { name: 'Nature 7', filename: 'basic7.jpg', category: 'basic' },
      // Intermediate images (7)
      { name: 'City 1', filename: 'intermediate1.jpg', category: 'intermediate' },
      { name: 'City 2', filename: 'intermediate2.jpg', category: 'intermediate' },
      { name: 'City 3', filename: 'intermediate3.jpg', category: 'intermediate' },
      { name: 'City 4', filename: 'intermediate4.jpg', category: 'intermediate' },
      { name: 'City 5', filename: 'intermediate5.jpg', category: 'intermediate' },
      { name: 'City 6', filename: 'intermediate6.jpg', category: 'intermediate' },
      { name: 'City 7', filename: 'intermediate7.jpg', category: 'intermediate' },
      // Advanced images (7)
      { name: 'Abstract 1', filename: 'advanced1.jpg', category: 'advanced' },
      { name: 'Abstract 2', filename: 'advanced2.jpg', category: 'advanced' },
      { name: 'Abstract 3', filename: 'advanced3.jpg', category: 'advanced' },
      { name: 'Abstract 4', filename: 'advanced4.jpg', category: 'advanced' },
      { name: 'Abstract 5', filename: 'advanced5.jpg', category: 'advanced' },
      { name: 'Abstract 6', filename: 'advanced6.jpg', category: 'advanced' },
      { name: 'Abstract 7', filename: 'advanced7.jpg', category: 'advanced' }
    ];

    for (const image of defaultImages) {
      const imageExists = await client.query(
        'SELECT id FROM images WHERE filename = $1',
        [image.filename]
      );

      if (imageExists.rows.length === 0) {
        await client.query(
          'INSERT INTO images (name, filename, category) VALUES ($1, $2, $3)',
          [image.name, image.filename, image.category]
        );
      }
    }

    await client.end();

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully with default data'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    await client.end();
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
}
