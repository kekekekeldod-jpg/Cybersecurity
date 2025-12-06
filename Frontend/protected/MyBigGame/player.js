import { Running, Staying } from "./playerStates.js";

export class Player { 
    constructor(game) {
        this.game = game;
        this.width = 500;
        this.height = 500;

        // Startposition merken
        this.startX = this.game.width / 2 - this.width / 2;
        this.startY = this.game.height - this.height - this.game.groundMargin;

        // aktuelle Position auf Start setzen
        this.x = this.startX;
        this.y = this.startY;

        // Physik
        this.vy = 0;
        this.weight = 1;

        // Sprite / Animation
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 0;
        this.fps = 17;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        // Bewegung
        this.speed = 0;  
        this.maxSpeed = 20;

        // States
        this.states = [new Staying(this), new Running(this)];
        this.currentState = this.states[0];
        this.currentState.enter();

        // Sounds
        this.backgroundMusic = this.game.backgroundMusic;
        this.gameOverMusic = this.game.gameOverMusic;
        this.jumpMusic = this.game.jumpMusic;
        this.feedLanding = this.game.feedLanding;
        this.runningMusic = this.game.runningMusic;

        this.wasInAir = false;   // war im letzten Frame in der Luft?
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vy = 0;
        this.speed = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.wasInAir = false;
        this.setState(0); // STAYING
    }

    update(input, deltaTime) {
        const dt = deltaTime / 16.67;
        // State-Logik
        this.currentState.handleInput(input);

        // --- Horizontale Bewegungen ---
        this.x += this.speed * dt;

        if (input.includes('ArrowRight')) {
          this.speed = this.maxSpeed;
          this.runningMusic.play();

        } else if (input.includes('ArrowLeft')) {
          this.speed = -this.maxSpeed;
          this.runningMusic.play();
          
        }  else {
            this.speed = 0;
            this.runningMusic.pause();
        } 

        // Game Over bei Randberührung
        if (this.x <= 0 || this.x >= this.game.width - this.width) {
            this.game.state = 'gameOver';
            this.backgroundMusic.pause();
            this.gameOverMusic.play();
            this.runningMusic.pause();
            return;
        }

        // --- Sprung: nur wenn am Boden ---
        if (input.includes('ArrowUp') && this.isOnGround()) {
            this.vy = -45;              // nach oben
            this.jumpMusic.currentTime = 0;
            this.jumpMusic.play();
        }

        // --- Vertikale Physik ---
        this.y += this.vy * dt;

        // Schwerkraft nur in der Luft
        if (!this.isOnGround()) {
            this.vy += this.weight;
            // Music in der Luft stoppen
            this.runningMusic.pause();
        } else {
            // auf Boden "snappen"
            this.y = this.game.height - this.height - this.game.groundMargin;
            if (this.vy > 0) this.vy = 0;
        }

        // Nicht über den oberen Rand
        if (this.y <= 0) this.y = 0;

        // --- Landing-Sound ---
        const currentlyOnGround = this.isOnGround();

        if (currentlyOnGround && this.wasInAir) {
            this.feedLanding.currentTime = 0;
            this.feedLanding.play();
        }

        // Zustand für nächsten Frame merken
        this.wasInAir = !currentlyOnGround;

        // --- Sprite Animationen ---
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
    }

    draw(context) {
        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    // Bodencheck – nur als Methode, kein Name-Konflikt mehr
    isOnGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    setState(state) {
        const newState = this.states[state];
        if (this.currentState === newState) return;
        this.currentState = newState;
        this.currentState.enter();
    }
}
