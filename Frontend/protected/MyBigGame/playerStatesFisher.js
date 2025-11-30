// playerStatesFisher.js
export const states = {
    FLYINGRIGHT: 0,
    FLYINGLEFT: 1,
};

class State {
    constructor(state) {
        this.state = state;
    }
} 

export class Flyingright extends State {
    constructor(playerFish) {
        super('FLYINGRIGHT');
        this.playerFish = playerFish;
    }

    enter() {
        this.playerFish.frameX = 0;
        this.playerFish.frameY = 1;           // Reihe für "nach rechts"
        this.playerFish.maxFrame = 9;
        this.playerFish.speedX = this.playerFish.maxSpeed; // → nach rechts
    }

    random() {
        // Rechte Kante erreicht?
        if (this.playerFish.x + this.playerFish.width >= this.playerFish.game.width) {
            // an der Kante festklemmen
            this.playerFish.x = this.playerFish.game.width - this.playerFish.width;
            // State wechseln → nach links
            this.playerFish.setState(states.FLYINGLEFT);
        }
    }
}

export class Flyingleft extends State {
    constructor(playerFish) {
        super('FLYINGLEFT');
        this.playerFish = playerFish;
    }

    enter() {
        this.playerFish.frameX = 0;
        this.playerFish.frameY = 0;            // Reihe für "nach links"
        this.playerFish.maxFrame = 9;
        this.playerFish.speedX = -this.playerFish.maxSpeed; // → nach links
    }

    random() {
        // Linke Kante erreicht?
        if (this.playerFish.x <= 0) {
            this.playerFish.x = 0;             // an linker Kante festklemmen
            this.playerFish.setState(states.FLYINGRIGHT);
        }
    }
}
