const User = require('../models/User');
const GameResult = require('../models/GameResult');

// Get User Profile & Stats
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Aggregate detailed stats
        const results = await GameResult.find({ userId: user.id });

        // Calculate stats per difficulty -> timeLimit
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
};

// Save Game Result
exports.saveGameResult = async (req, res) => {
    try {
        const { gameMode, difficulty, score, timeTaken, timeLimit, perfectRounds, totalRounds } = req.body;

        console.log(`[SERVER] Save Request - Mode: ${gameMode}, Diff: ${difficulty}, Limit: ${timeLimit}`);

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

        await newResult.save();
        console.log(`[SERVER] Saved Result ID: ${newResult._id}`);

        // Update User Aggregated Stats
        const user = await User.findById(req.user.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.stats) {
            user.stats = { gamesPlayed: 0, totalScore: 0, totalTimePlayed: 0 };
        }

        user.stats.gamesPlayed++;
        user.stats.totalScore += score;
        user.stats.totalTimePlayed += timeTaken;
        await user.save();

        res.json(newResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
