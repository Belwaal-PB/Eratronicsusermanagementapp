// Simple API endpoint for data management
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple in-memory storage (in production, you'd use a database)
  let dataStore = {
    users: [
      {
        id: 1,
        username: 'admin',
        password: hashPassword('admin123'),
        user_type: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user_a',
        password: hashPassword('passworda'),
        user_type: 'a',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        username: 'user_b',
        password: hashPassword('passwordb'),
        user_type: 'b',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        username: 'user_c',
        password: hashPassword('passwordc'),
        user_type: 'c',
        created_at: new Date().toISOString()
      }
    ],
    images: [
      // Basic images (7)
      {id: 1, name: 'Nature 1', filename: 'basic1.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 2, name: 'Nature 2', filename: 'basic2.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 3, name: 'Nature 3', filename: 'basic3.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 4, name: 'Nature 4', filename: 'basic4.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 5, name: 'Nature 5', filename: 'basic5.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 6, name: 'Nature 6', filename: 'basic6.jpg', category: 'basic', created_at: new Date().toISOString()},
      {id: 7, name: 'Nature 7', filename: 'basic7.jpg', category: 'basic', created_at: new Date().toISOString()},
      // Intermediate images (7)
      {id: 8, name: 'City 1', filename: 'intermediate1.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 9, name: 'City 2', filename: 'intermediate2.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 10, name: 'City 3', filename: 'intermediate3.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 11, name: 'City 4', filename: 'intermediate4.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 12, name: 'City 5', filename: 'intermediate5.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 13, name: 'City 6', filename: 'intermediate6.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      {id: 14, name: 'City 7', filename: 'intermediate7.jpg', category: 'intermediate', created_at: new Date().toISOString()},
      // Advanced images (7)
      {id: 15, name: 'Abstract 1', filename: 'advanced1.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 16, name: 'Abstract 2', filename: 'advanced2.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 17, name: 'Abstract 3', filename: 'advanced3.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 18, name: 'Abstract 4', filename: 'advanced4.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 19, name: 'Abstract 5', filename: 'advanced5.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 20, name: 'Abstract 6', filename: 'advanced6.jpg', category: 'advanced', created_at: new Date().toISOString()},
      {id: 21, name: 'Abstract 7', filename: 'advanced7.jpg', category: 'advanced', created_at: new Date().toISOString()}
    ],
    clicks: [],
    nextUserId: 5,
    nextImageId: 22,
    nextClickId: 1
  };

  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
  }

  function getStatistics() {
    const nonAdminUsers = dataStore.users.filter(u => u.user_type !== 'admin');
    
    // Group clicks by user and image
    const clickGroups = {};
    dataStore.clicks.forEach(click => {
      const user = dataStore.users.find(u => u.id === click.user_id);
      const image = dataStore.images.find(i => i.id === click.image_id);
      
      if (user && image && user.user_type !== 'admin') {
        const key = `${user.id}-${image.id}`;
        if (!clickGroups[key]) {
          clickGroups[key] = {
            username: user.username,
            user_type: user.user_type,
            image_name: image.name,
            category: image.category,
            click_count: 0,
            last_clicked: click.clicked_at
          };
        }
        clickGroups[key].click_count++;
        if (click.clicked_at > clickGroups[key].last_clicked) {
          clickGroups[key].last_clicked = click.clicked_at;
        }
      }
    });

    const stats = Object.values(clickGroups).sort((a, b) => (a.username + b.image_name).localeCompare(b.username + a.image_name));
    
    const summary = {
      total_users: nonAdminUsers.length,
      total_clicks: dataStore.clicks.filter(c => {
        const user = dataStore.users.find(u => u.id === c.user_id);
        return user && user.user_type !== 'admin';
      }).length,
      total_images: dataStore.images.length,
      avg_clicks_per_user: nonAdminUsers.length > 0 ? 
        dataStore.clicks.filter(c => {
          const user = dataStore.users.find(u => u.id === c.user_id);
          return user && user.user_type !== 'admin';
        }).length / nonAdminUsers.length : 0
    };

    return { stats, summary };
  }

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/data', '');

  try {
    switch (method) {
      case 'GET':
        if (path === '/users') {
          res.status(200).json(dataStore.users);
        } else if (path === '/images') {
          res.status(200).json(dataStore.images);
        } else if (path === '/clicks') {
          res.status(200).json(dataStore.clicks);
        } else if (path === '/stats') {
          res.status(200).json(getStatistics());
        } else {
          res.status(200).json({
            users: dataStore.users,
            images: dataStore.images,
            clicks: dataStore.clicks
          });
        }
        break;

      case 'POST':
        const body = req.body;
        
        if (path === '/login') {
          const { username, password } = body;
          const user = dataStore.users.find(u => u.username === username);
          
          if (user && verifyPassword(password, user.password)) {
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
        } else if (path === '/users') {
          const { username, password, user_type } = body;
          
          if (dataStore.users.find(u => u.username === username)) {
            res.status(400).json({ success: false, message: 'Username already exists' });
            return;
          }

          const newUser = {
            id: dataStore.nextUserId++,
            username,
            password: hashPassword(password),
            user_type,
            created_at: new Date().toISOString()
          };

          dataStore.users.push(newUser);
          res.status(201).json({ success: true, user: newUser });
        } else if (path === '/images') {
          const { name, category, filename, imageData } = body;
          
          const newImage = {
            id: dataStore.nextImageId++,
            name,
            filename,
            category,
            imageData,
            created_at: new Date().toISOString()
          };

          dataStore.images.push(newImage);
          res.status(201).json({ success: true, image: newImage });
        } else if (path === '/clicks') {
          const { user_id, image_id } = body;
          
          const newClick = {
            id: dataStore.nextClickId++,
            user_id,
            image_id,
            clicked_at: new Date().toISOString()
          };

          dataStore.clicks.push(newClick);
          res.status(201).json({ success: true, click: newClick });
        } else if (path === '/users/bulk') {
          const { users } = body;
          let successCount = 0;
          const errors = [];

          users.forEach((userData, index) => {
            try {
              const { username, password, user_type } = userData;
              
              if (dataStore.users.find(u => u.username === username)) {
                errors.push(`Row ${index + 1}: Username '${username}' already exists`);
                return;
              }

              const newUser = {
                id: dataStore.nextUserId++,
                username,
                password: hashPassword(password),
                user_type,
                created_at: new Date().toISOString()
              };

              dataStore.users.push(newUser);
              successCount++;
            } catch (error) {
              errors.push(`Row ${index + 1}: ${error.message}`);
            }
          });

          res.status(200).json({ 
            success: true, 
            successCount, 
            errorCount: errors.length,
            errors 
          });
        } else {
          res.status(404).json({ success: false, message: 'Endpoint not found' });
        }
        break;

      case 'DELETE':
        if (path.startsWith('/users/')) {
          const userId = parseInt(path.split('/')[2]);
          const userIndex = dataStore.users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
          }

          dataStore.users.splice(userIndex, 1);
          dataStore.clicks = dataStore.clicks.filter(c => c.user_id !== userId);
          res.status(200).json({ success: true });
        } else if (path.startsWith('/images/')) {
          const imageId = parseInt(path.split('/')[2]);
          const imageIndex = dataStore.images.findIndex(i => i.id === imageId);
          
          if (imageIndex === -1) {
            res.status(404).json({ success: false, message: 'Image not found' });
            return;
          }

          dataStore.images.splice(imageIndex, 1);
          dataStore.clicks = dataStore.clicks.filter(c => c.image_id !== imageId);
          res.status(200).json({ success: true });
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
