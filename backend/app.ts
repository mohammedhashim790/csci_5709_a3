import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';
import fileRoutes from './routes/file.routes.ts';
import * as http from "node:http";
import {Server as SocketIOServer} from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);


// Middleware to parse JSON requests
app.use(express.json());

// CORS middleware
app.use(cors({origin: '*', optionsSuccessStatus: 200}));

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carebridge-md')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('CareBridge MD Backend');
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use("/api/files", fileRoutes);

// Start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
