export const GameConfig = {
    API_URL: 'http://localhost:5000/api', // Should be env var in real prod, but hardcoded for now as per plan

    // Difficulty Settings (Time limits in seconds)
    DIFFICULTIES: {
        easy: { timeLimit: 0 }, // 0 = no limit
        normal: { timeLimit: 0 },
        hard: { timeLimit: 0 }, // Adjust if needed
        // We can extend this with specific time limits if the logic requires it
    },

    // Game Constants
    MAX_ROUNDS: 5,
    PERFECT_SCORE: 5000,
    MAX_DISTANCE: 2000, // Max distance for scoring (arbitrary units based on map)
};
