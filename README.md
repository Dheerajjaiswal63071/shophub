# ShopHub E-Commerce Application

A modern e-commerce platform built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dheerajjaiswal63071/shophub.git
   cd shophub
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create .env file (copy from .env.example if available)
   # Configure your MongoDB URI and other settings
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   
   # Create .env file from template
   cp .env.example .env
   
   # Edit .env and set VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start Frontend (in a new terminal)**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:3001`

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000/api
   - Admin Login: admin@shophub.com / admin123

## 📁 Project Structure

```
shophub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   └── pages/         # Page components
│   └── .env.example       # Environment variables template
│
└── server/                # Node.js backend
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   └── middleware/    # Custom middleware
    └── .env               # Environment variables (not in git)
```

## ⚙️ Configuration

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend Environment Variables (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🛠️ Common Issues

### Console Error: ERR_CONNECTION_REFUSED

If you see connection refused errors in the browser console:

1. **Ensure backend is running** on port 5000
2. **Check client/.env file exists** with `VITE_API_URL=http://localhost:5000/api`
3. **Restart the frontend server** after creating/modifying .env file
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R)

### Port Already in Use

If ports 3001 or 5000 are in use:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

## 🌐 Deployment

- Frontend can be deployed to Vercel, Netlify, or similar platforms
- Backend can be deployed to Render, Heroku, or similar platforms
- Update `VITE_API_URL` in client to point to your deployed backend
- Update `CORS_ORIGIN` in server to include your deployed frontend URL

## 📝 Features

- User authentication and authorization
- Product browsing and search
- Shopping cart functionality
- Order management
- Admin dashboard
- Image upload with Cloudinary
- Responsive design with Tailwind CSS

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
