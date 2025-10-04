// Postgres-based API endpoint for data management
const { createClient } = require('@vercel/postgres');

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

// Database helper functions
async function getUsers() {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users ORDER BY created_at');
    return result.rows;
  } finally {
    await client.end();
  }
}

async function getImages() {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM images ORDER BY created_at');
    return result.rows;
  } finally {
    await client.end();
  }
}

async function getClicks() {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM clicks ORDER BY clicked_at');
    return result.rows;
  } finally {
    await client.end();
  }
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
  }

  async function getStatistics() {
    const client = createClient();
    try {
      await client.connect();
      
      // Get non-admin users count
      const usersResult = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE user_type != $1',
        ['admin']
      );
      const totalUsers = parseInt(usersResult.rows[0].count);

      // Get total clicks count for non-admin users
      const clicksResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM clicks c 
        JOIN users u ON c.user_id = u.id 
        WHERE u.user_type != $1
      `, ['admin']);
      const totalClicks = parseInt(clicksResult.rows[0].count);

      // Get total images count
      const imagesResult = await client.query('SELECT COUNT(*) as count FROM images');
      const totalImages = parseInt(imagesResult.rows[0].count);

      // Get detailed click statistics
      const statsResult = await client.query(`
        SELECT 
          u.username,
          u.user_type,
          i.name as image_name,
          i.category,
          COUNT(c.id) as click_count,
          MAX(c.clicked_at) as last_clicked
        FROM clicks c
        JOIN users u ON c.user_id = u.id
        JOIN images i ON c.image_id = i.id
        WHERE u.user_type != $1
        GROUP BY u.id, u.username, u.user_type, i.id, i.name, i.category
        ORDER BY u.username, i.name
      `, ['admin']);

      const stats = statsResult.rows.map(row => ({
        username: row.username,
        user_type: row.user_type,
        image_name: row.image_name,
        category: row.category,
        click_count: parseInt(row.click_count),
        last_clicked: row.last_clicked
      }));

      const summary = {
        total_users: totalUsers,
        total_clicks: totalClicks,
        total_images: totalImages,
        avg_clicks_per_user: totalUsers > 0 ? totalClicks / totalUsers : 0
      };

      return { stats, summary };
    } finally {
      await client.end();
    }
  }

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/data', '');

  try {
    switch (method) {
      case 'GET':
        if (path === '/users') {
          const users = await getUsers();
          res.status(200).json(users);
        } else if (path === '/images') {
          const images = await getImages();
          res.status(200).json(images);
        } else if (path === '/clicks') {
          const clicks = await getClicks();
          res.status(200).json(clicks);
        } else if (path === '/stats') {
          const stats = await getStatistics();
          res.status(200).json(stats);
        } else {
          const [users, images, clicks] = await Promise.all([
            getUsers(),
            getImages(),
            getClicks()
          ]);
          res.status(200).json({
            users,
            images,
            clicks
          });
        }
        break;

      case 'POST':
        const body = req.body;
        
        if (path === '/login') {
          const { username, password } = body;
          const client = createClient();
          
          try {
            await client.connect();
            const result = await client.query(
              'SELECT * FROM users WHERE username = $1',
              [username]
            );
            
            if (result.rows.length > 0) {
              const user = result.rows[0];
              if (verifyPassword(password, user.password_hash)) {
                res.status(200).json({
                  success: true,
                  user: {
                    id: user.id,
                    username: user.username,
                    user_type: user.user_type
                  }
                });
              } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
              }
            } else {
              res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
          } finally {
            await client.end();
          }
        } else if (path === '/users') {
          const { username, password, user_type } = body;
          const client = createClient();
          
          try {
            await client.connect();
            
            // Check if username already exists
            const existingUser = await client.query(
              'SELECT id FROM users WHERE username = $1',
              [username]
            );
            
            if (existingUser.rows.length > 0) {
              res.status(400).json({ success: false, message: 'Username already exists' });
              return;
            }

            const result = await client.query(
              'INSERT INTO users (username, password_hash, user_type) VALUES ($1, $2, $3) RETURNING *',
              [username, hashPassword(password), user_type]
            );

            const newUser = result.rows[0];
            res.status(201).json({ success: true, user: newUser });
          } finally {
            await client.end();
          }
        } else if (path === '/images') {
          const { name, category, filename, imageData } = body;
          const client = createClient();
          
          try {
            await client.connect();
            const result = await client.query(
              'INSERT INTO images (name, filename, category, image_data) VALUES ($1, $2, $3, $4) RETURNING *',
              [name, filename, category, imageData]
            );

            const newImage = result.rows[0];
            res.status(201).json({ success: true, image: newImage });
          } finally {
            await client.end();
          }
        } else if (path === '/clicks') {
          const { user_id, image_id } = body;
          const client = createClient();
          
          try {
            await client.connect();
            const result = await client.query(
              'INSERT INTO clicks (user_id, image_id) VALUES ($1, $2) RETURNING *',
              [user_id, image_id]
            );

            const newClick = result.rows[0];
            res.status(201).json({ success: true, click: newClick });
          } finally {
            await client.end();
          }
        } else if (path === '/users/bulk') {
          const { users } = body;
          const client = createClient();
          
          try {
            await client.connect();
            let successCount = 0;
            const errors = [];

            for (let i = 0; i < users.length; i++) {
              try {
                const { username, password, user_type } = users[i];
                
                // Check if username already exists
                const existingUser = await client.query(
                  'SELECT id FROM users WHERE username = $1',
                  [username]
                );
                
                if (existingUser.rows.length > 0) {
                  errors.push(`Row ${i + 1}: Username '${username}' already exists`);
                  continue;
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
        } else {
          res.status(404).json({ success: false, message: 'Endpoint not found' });
        }
        break;

      case 'DELETE':
        if (path.startsWith('/users/')) {
          const userId = parseInt(path.split('/')[2]);
          const client = createClient();
          
          try {
            await client.connect();
            
            // Check if user exists
            const userResult = await client.query(
              'SELECT id FROM users WHERE id = $1',
              [userId]
            );
            
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
        } else if (path.startsWith('/images/')) {
          const imageId = parseInt(path.split('/')[2]);
          const client = createClient();
          
          try {
            await client.connect();
            
            // Check if image exists
            const imageResult = await client.query(
              'SELECT id FROM images WHERE id = $1',
              [imageId]
            );
            
            if (imageResult.rows.length === 0) {
              res.status(404).json({ success: false, message: 'Image not found' });
              return;
            }

            // Delete image (cascade will handle clicks)
            await client.query('DELETE FROM images WHERE id = $1', [imageId]);
            res.status(200).json({ success: true });
          } finally {
            await client.end();
          }
        } else {
          res.status(404).json({ success: false, message: 'Endpoint not found' });
        }
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
