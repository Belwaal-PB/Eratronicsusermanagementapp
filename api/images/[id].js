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

  console.log('Images [id] API Request:', { method, id, url: req.url });

  try {
    if (method === 'DELETE') {
      // Delete image endpoint
      const imageId = parseInt(id);
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
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Images [id] API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
