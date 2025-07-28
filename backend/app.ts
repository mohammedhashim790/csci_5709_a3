import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';
import fileRoutes from './routes/file.routes.ts';
import * as http from "node:http";

import prometheus from 'prom-client';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// default metrics (CPU, memory, event loop, etc.)
prometheus.collectDefaultMetrics(); // Scrape every 5 seconds

const httpRequestDurationMicroseconds = new prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000] // Define your buckets
});

const httpRequestsTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDurationMicroseconds
            .labels(req.method, req.path, String(res.statusCode))
            .observe(duration);
        httpRequestsTotal
            .labels(req.method, req.path, String(res.statusCode))
            .inc();
    });
    next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
});


// Middleware to parse JSON requests
app.use(express.json());

// CORS middleware
app.use(cors({origin: '*', optionsSuccessStatus: 200}));

/**
 * Middleware to set security headers
 * Sets X-Frame-Options to DENY to prevent clickjacking attacks
 */
app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; font-src 'self';");
    next();
});
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
