const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameMode: { type: String, required: true }, // e.g. 'standard', 'location', 'item'
    difficulty: { type: String, default: 'normal' },
    score: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // seconds
    timeLimit: { type: Number, default: 0 }, // 0 for no limit, otherwise seconds
    timestamp: { type: Date, default: Date.now },
    perfectRounds: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 0 }
});

module.exports = mongoose.model('GameResult', GameResultSchema);
