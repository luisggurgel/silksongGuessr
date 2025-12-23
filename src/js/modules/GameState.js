import { GameConfig } from './GameConfig.js';

export const GAMESTATES = {
    gameMenu: 0,
    game: 1,
    roundEnd: 2,
    gameEnd: 3,
    options: 4,
    locationData: 5 // Loading
};

export class GameState {
    constructor() {
        this.currentState = GAMESTATES.gameMenu;
        this.score = 0;
        this.currentRound = 1;
        this.totalRounds = GameConfig.MAX_ROUNDS;
        this.locations = []; // All available locations for current mode
        this.usedLocationIndices = [];
        this.currentLocation = null;
        this.currentLocationIndex = -1;

        this.history = []; // Array of round results

        this.startTime = 0;
        this.timerInterval = null;
        this.currentRoundTime = 0;
        this.totalTimePlayed = 0;
    }

    setState(state) {
        this.currentState = state;
    }

    reset() {
        this.score = 0;
        this.currentRound = 1;
        this.history = [];
        this.usedLocationIndices = [];
        this.totalTimePlayed = 0;
    }

    addScore(points) {
        this.score += points;
    }

    nextRound() {
        this.currentRound++;
    }

    isGameOver() {
        return this.currentRound > this.totalRounds;
    }
}
