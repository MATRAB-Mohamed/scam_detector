require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { admin, db } = require('./firebase');
const scamRoutes = require('./routes/scam');

const app = express();
const port = process.env.PORT || 5001;

// Configure CORS
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/scam', scamRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// 404 handler
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        path: req.path
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Firebase Admin initialized');
    console.log('CORS enabled for:', ['http://localhost:8000', 'http://127.0.0.1:8000']);
});
