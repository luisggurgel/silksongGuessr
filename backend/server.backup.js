require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const GameResult = require('./models/GameResult');

const app = express();
app.use(express.json());
app.use(cors());

// Log all requests
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hkguessr';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    console.log('Register request:', req.body);
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists (email)');
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = await User.findOne({ username });
        if (user) {
            console.log('User already exists (username)');
            return res.status(400).json({ msg: 'Username already taken' });
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log('User registered:', user.id);

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    console.log('Login request:', req.body);
    const { loginInput, password } = req.body; // loginInput can be email or username
    try {
        // Find by email OR username
        let user = await User.findOne({
            $or: [
                { email: loginInput },
                { username: loginInput }
            ]
        });

        if (!user) {
            console.log('User not found for input:', loginInput);
            return res.status(400).json({ msg: 'Invalid Credentials (User)' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', user.username);
            return res.status(400).json({ msg: 'Invalid Credentials (Password)' });
        }

        console.log('Login successful:', user.id);
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '390966559256-fjuk1ilgk6jmel31l1ul9v6qu8l7odai.apps.googleusercontent.com');

console.log('Registering route: POST /api/auth/google');
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || '390966559256-fjuk1ilgk6jmel31l1ul9v6qu8l7odai.apps.googleusercontent.com'
        });
        const { name, email, sub } = ticket.getPayload(); // sub is google ID

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            // Create new user
            // We need a password for the model, so we generate a random secure one
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = new User({
                username: name, // Google name might duplicate, but we'll try
                email: email,
                password: randomPassword
            });

            // Handle potential username collision by appending random string
            const existingName = await User.findOne({ username: name });
            if (existingName) {
                user.username = name + Math.floor(Math.random() * 10000);
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(randomPassword, salt);

            await user.save();
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email }, isNewUser });
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(400).json({ msg: 'Google Auth Failed', error: err.message });
    }
});

// Get User Profile & Stats
app.get('/api/user/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.user.id).select('-password');
        // Aggregate detailed stats
        const results = await GameResult.find({ userId: user.id });

        // Calculate stats per difficulty -> timeLimit
        // Structure: stats[difficulty][timeLimit] = { highScore, games, totalScore, totalTime, bestTime (optional) }
        const startStats = { games: 0, totalScore: 0, highScore: 0, totalTime: 0 };
        const modeStats = {};

        const activity = {};

        results.forEach(r => {
            // Activity Heatmap Data
            if (r.timestamp) {
                const dateKey = new Date(r.timestamp).toISOString().split('T')[0];
                activity[dateKey] = (activity[dateKey] || 0) + 1;
            }

            // Normalize difficulty string (lowercase)
            const diff = (r.difficulty || 'normal').toLowerCase();
            // Group time limit (e.g. "5", "10", "30", "0")
            const time = r.timeLimit ? r.timeLimit.toString() : '0';

            if (!modeStats[diff]) {
                modeStats[diff] = {};
            }
            if (!modeStats[diff][time]) {
                modeStats[diff][time] = { ...startStats };
            }

            const s = modeStats[diff][time];
            s.games++;
            s.totalScore += r.score;
            s.totalTime += r.timeTaken;
            if (r.score > s.highScore) {
                s.highScore = r.score;
            }
        });

        res.json({ user, stats: modeStats, activity, recentKey: results.slice(-5) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Save Game Result
app.post('/api/game/result', auth, async (req, res) => {
    try {
        const { gameMode, difficulty, score, timeTaken, timeLimit, perfectRounds, totalRounds } = req.body;

        console.log(`[SERVER] Save Request - Mode: ${gameMode}, Diff: ${difficulty}, Limit: ${timeLimit} (${typeof timeLimit})`);

        const newResult = new GameResult({
            userId: req.user.user.id,
            gameMode,
            difficulty,
            score,
            timeTaken,
            timeLimit: timeLimit || 0,
            perfectRounds,
            totalRounds
        });

        // Log the document before saving to see if Mongoose stripped it
        // console.log('[SERVER] Document to be saved:', newResult); 

        await newResult.save();
        console.log(`[SERVER] Saved Result ID: ${newResult._id}, TimeLimit stored: ${newResult.timeLimit}`);

        // Update User Aggregated Stats
        const user = await User.findById(req.user.user.id);
        if (!user) {
            console.error('[SERVER] User not found during stats update!');
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize stats if missing
        if (!user.stats) {
            console.log('[SERVER] Initializing user stats object');
            user.stats = { gamesPlayed: 0, totalScore: 0, totalTimePlayed: 0 };
        }

        user.stats.gamesPlayed++;
        user.stats.totalScore += score;
        user.stats.totalTimePlayed += timeTaken;
        await user.save();
        console.log('[SERVER] User stats updated:', user.stats);

        res.json(newResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
