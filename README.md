# Eratronics User Management System

A modern, responsive user management system with image selection capabilities built with vanilla JavaScript and Bootstrap.

## Features

- **User Authentication**: Login system with different user types (Admin, Type A, B, C)
- **Image Gallery**: Categorized image selection based on user permissions
- **Admin Dashboard**: Complete user and image management
- **Statistics**: Click tracking and analytics
- **Excel Import**: Bulk user creation from Excel files
- **Responsive Design**: Mobile-friendly interface

## User Types & Permissions

- **Admin**: Full access to all features, user management, image management
- **Type A**: Access to Basic images only (7 images)
- **Type B**: Access to Basic + Intermediate images (14 images)
- **Type C**: Access to all images (21 images)

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Type A**: username: `user_a`, password: `passworda`
- **Type B**: username: `user_b`, password: `passwordb`
- **Type C**: username: `user_c`, password: `passwordc`

## Deployment on Vercel

### Prerequisites
- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

### Steps to Deploy

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

3. **Custom Domain (Optional)**
   - In your Vercel dashboard, go to project settings
   - Add your custom domain in the "Domains" section

### Manual Deployment

If you prefer to deploy manually:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Or use a local server:
   ```bash
   npx serve .
   ```

## File Structure

```
├── index.html          # Main HTML file
├── app.js             # JavaScript application logic
├── static/
│   ├── style.css      # CSS styles
│   ├── thumbnails/    # Image thumbnails
│   └── uploads/       # Full-size images
├── vercel.json        # Vercel configuration
├── package.json       # Project metadata
└── README.md          # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Storage**: LocalStorage (client-side)
- **Excel Processing**: SheetJS
- **Deployment**: Vercel

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use this project for your own purposes.
