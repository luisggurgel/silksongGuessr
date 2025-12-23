require('dotenv').config({ path: __dirname + '/.env' }); // Adjust if .env is elsewhere
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Security Middleware
app.use(helmet());
app.use(cors()); // Configure this for production with specific origin

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later"
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // stricter limit for auth routes
    message: "Too many login attempts, please try again later"
});

// Apply rate limits
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/', require('./routes/gameRoutes')); // Mapping to root or /api depending on structure

// If game routes are expected at /api/user and /api/game, we should mount them carefully.
// Our gameRoutes defines paths like /user/profile.
// So mounting at /api works: /api/user/profile.
app.use('/api', require('./routes/gameRoutes'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    // Adjust logic if "backend" folder structure is different or if build is in ROOT/dist
    app.use(express.static('../dist'));

    app.get('*', (req, res) => {
        const path = require('path');
        res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
