const { createClient } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;
  const { id } = req.query;

  console.log('Users [id] API Request:', { method, id, url: req.url });

  try {
    if (id === 'bulk' && method === 'POST') {
      // Bulk add users endpoint
      const { users } = req.body;
      const client = createClient();
      
      try {
        await client.connect();
        let successCount = 0;
        const errors = [];

        for (let i = 0; i < users.length; i++) {
          try {
            const { username, password, user_type } = users[i];
            
            // Check if username already exists
            const existingUser = await client.query('SELECT id FROM users WHERE username = $1', [username]);
            
            if (existingUser.rows.length > 0) {
              errors.push(`Row ${i + 1}: Username '${username}' already exists`);
              continue;
            }

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

            await client.query(
              'INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3)',
              [username, hashPassword(password), user_type]
            );
            
            successCount++;
          } catch (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
          }
        }

        res.status(200).json({
          success: true, 
          successCount, 
          errorCount: errors.length,
          errors 
        });
      } finally {
        await client.end();
      }
    } else if (method === 'DELETE') {
      // Delete user endpoint
      const userId = parseInt(id);
      const client = createClient();
      
      try {
        await client.connect();
        
        // Check if user exists
        const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
          res.status(404).json({ success: false, message: 'User not found' });
          return;
        }

        // Delete user (cascade will handle clicks)
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        res.status(200).json({ success: true });
      } finally {
        await client.end();
      }
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users [id] API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
