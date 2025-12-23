const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Summary stats (can be aggregated from GameResults too, but good for caching)
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalTimePlayed: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('User', UserSchema);
