import { Flyingleft, Flyingright, states } from "./playerStatesFisher.js";

export class PlayerFish {
    constructor(game){
        this.game = game;
        this.width = 500;
        this.height = 500;

        // Startposition
        this.startX = 0;
        this.startY = 0 + this.game.heavyMargin;

        this.x = this.startX;
        this.y = this.startY;

        this.image = document.getElementById('playerFish');

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.maxSpeed = 10;
        this.speedX = this.maxSpeed; // Startgeschwindigkeit nach rechts

        // States: Index 0 = FLYINGRIGHT, Index 1 = FLYINGLEFT
        this.states = [
            new Flyingright(this), // 0
            new Flyingleft(this)   // 1
        ];

        this.currentState = this.states[states.FLYINGRIGHT];
        this.currentState.enter();
        
    } 

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.speed = 0;
    }

    update(deltaTime) {
        // Bewegung
        this.x += this.speedX;

        // Wände checken / State wechseln
        this.currentState.random();

        // Sprite Animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
    }

     draw(context) {
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
     }

    setState(stateIndex) {
        const newState = this.states[stateIndex];
        if (this.currentState === newState) return;
        this.currentState = newState;
        this.currentState.enter();
    }
}
