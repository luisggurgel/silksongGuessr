export class InputHandler {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.init();
    }

    init() {
        // Keyboard Events
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.game.handleSpacePress();
            }
            if (e.code === 'Escape') {
                this.game.toggleMenu();
            }
        });

        // Add other listeners as needed (e.g. mouse clicks on map are usually handled by Leaflet directly)
    }
}
