const { createClient } = require('@vercel/postgres');

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
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

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log('Images API Request:', { method, path, url: req.url });

  try {
    if (path.startsWith('/api/images/') && method === 'DELETE') {
      // Delete image endpoint
      const imageId = parseInt(path.split('/')[3]);
      const client = createClient();
      
      try {
        await client.connect();
        
        // Check if image exists
        const imageResult = await client.query('SELECT id FROM images WHERE id = $1', [imageId]);
        
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
    } else if (path === '/api/images' && method === 'POST') {
      // Add image endpoint
      const { name, category, filename, imageData } = await parseBody(req);
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
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Images API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};