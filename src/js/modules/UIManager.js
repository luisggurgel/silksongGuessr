export class UIManager {
    constructor() {
        this.dom = {
            gameMenu: document.getElementById('gameOptionsWindow'), // Correct ID
            gameEnd: document.getElementById('gameOverWindow'),     // Correct ID
            // gameUI: document.getElementById('mapContainer'), // Generally we don't hide this
            scoreLabel: document.getElementById('roundScoreDisplay'), // For round score
            roundCounter: document.getElementById('round'), // Correct ID
            // Add other DOM elements as needed
        };
    }

    showScreen(screenName) {
        // Simple toggle for now: Hide modals if entering 'game', show specific modal otherwise
        const modals = ['gameMenu', 'gameEnd'];

        if (screenName === 'game') {
            modals.forEach(key => {
                if (this.dom[key]) this.dom[key].style.display = 'none';
            });
            return;
        }

        // Hide other modals
        modals.forEach(key => {
            if (this.dom[key] && key !== screenName) {
                this.dom[key].style.display = 'none';
            }
        });

        // Show requested screen
        if (this.dom[screenName]) {
            this.dom[screenName].style.display = 'block'; // 'block' is standard for these windows
        }
    }

    updateScore(score) {
        if (this.dom.scoreLabel) {
            this.dom.scoreLabel.textContent = `Score: ${score}`;
        }
    }

    updateRound(current, total) {
        if (this.dom.roundCounter) {
            this.dom.roundCounter.textContent = `Round ${current}/${total}`;
        }
    }
}
