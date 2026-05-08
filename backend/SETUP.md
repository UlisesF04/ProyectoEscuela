# Backend Setup Guide

## Prerequisites

1. **Node.js** installed on your system
2. **MongoDB Atlas account** with cluster created
3. **Environment variables configured** in `.env` file

## Environment Variables

Ensure your `.env` file in the `backend/` folder contains:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/proyecto_escuela?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Replace `username`, `password`, and the cluster name with your actual MongoDB Atlas credentials.

## Installation

```bash
cd backend
npm install
```

## Running the Backend

### Development Mode (with auto-restart on file changes):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## Expected Output

When successfully connected to MongoDB, you should see:

```
╔════════════════════════════════════════╗
║   ProyectoEscuela Backend Server       ║
║   🚀 Running on port 5000              ║
║   🔗 http://localhost:5000             ║
║   📚 Database: Connected               ║
╚════════════════════════════════════════╝
```

## Testing the Connection

Once the server is running, test it in your browser or with curl:

```bash
# Basic health check
curl http://localhost:5000/

# Detailed health status
curl http://localhost:5000/health
```

## MongoDB Atlas Troubleshooting

### Connection Refused Error
- ✅ Ensure your IP address is whitelisted in MongoDB Atlas
- ✅ Double-check your username and password
- ✅ Verify the connection string format

### Database Not Found
- ✅ MongoDB Atlas will auto-create the database on first write
- ✅ You can manually create it via MongoDB Atlas web console

### Cannot Find Module 'mongoose'
- ✅ Run `npm install` to reinstall dependencies
- ✅ Delete `node_modules` and reinstall if issues persist

## Next Steps

1. Create database models in `backend/modules/`
2. Set up routes for authentication, students, and absences
3. Test API endpoints with Postman or curl
