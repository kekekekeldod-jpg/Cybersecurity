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
        this.gravity = 3600;
        this.jumpStrength = -2200;
        this.jumpStrengthAfterHit = -2200;

        // Bewegung
        this.speed = 0;  
        this.maxSpeed = 1200;

        // Sprite / Animation
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 0;
        this.fps = 17;
        this.frameInterval = 1 / this.fps;
        this.frameTimer = 0;

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

        // Merken, ob der Running-Sound am laufen ist
        this.isRunningSoundPlaying = false;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vy = 0;
        this.speed = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frameTimer = 0;
        this.wasInAir = false;

        // Running-Sound sicher stoppen
        this.isRunningSoundPlaying = false;
        this.runningMusic.pause();

        this.setState(0); // STAYING
    }

    update(input, dt) {
        // State-Logik
        this.currentState.handleInput(input);

        // --- Horizontale Bewegungen + Running-Sound-Logik ---
        const movingRight  = input.includes('ArrowRight');
        const movingLeft   = input.includes('ArrowLeft');
        const movingHorizontally = movingRight || movingLeft;
        const onGround = this.isOnGround();

        if (movingRight) {
            this.speed = this.maxSpeed;
        } else if (movingLeft) {
            this.speed = -this.maxSpeed;
        } else {
            this.speed = 0;
        }

        // Running-Sound nur bei Zustandswechsel, nicht jedes Frame
        if (movingHorizontally && onGround) {
            if (!this.isRunningSoundPlaying) {
                this.runningMusic.currentTime = 0;
                const p = this.runningMusic.play();
                if (p && p.catch) p.catch(() => {});
                this.isRunningSoundPlaying = true;
            }
        } else {
            if (this.isRunningSoundPlaying) {
                this.runningMusic.pause();
                this.isRunningSoundPlaying = false;
            }
        }

        // --- Horizontale Bewegungen ---
        this.x += this.speed * dt;

        // Game Over bei Randberührung
        if (this.x <= 0 || this.x >= this.game.width - this.width) {
            this.game.state = 'gameOver';
            this.backgroundMusic.pause();
            this.gameOverMusic.play();
            this.runningMusic.pause();
            this.isRunningSoundPlaying = false;
            return;
        }

        // --- Sprung: nur wenn am Boden ---
        if (input.includes('ArrowUp') && this.isOnGround()) {
            this.vy = this.jumpStrength;              // nach oben
            this.jumpMusic.currentTime = 0;
            this.jumpMusic.play();
        }

        // --- Vertikale Physik ---
        this.y += this.vy * dt;

        // Schwerkraft nur in der Luft
        if (!this.isOnGround()) {
            this.vy += this.gravity * dt;
            // WICHTIG: hier NICHT mehr jedes Frame runningMusic.pause()
            // das regeln wir über isRunningSoundPlaying oben
        } else {
            // auf Boden "snappen"
            this.y = this.game.height - this.height - this.game.groundMargin;
            if (this.vy > 0) this.vy = 0;
        }

        // Nicht über den oberen Rand
        if (this.y <= 0) this.y = 0;


        // Kollision = Game 
        const player = this.game.player;
        const playerSecond = this.game.playerFish;

        const collsion = 
            player.x < playerSecond.x + playerSecond.width &&
            player.x + player.width > playerSecond.x &&
            player.y < playerSecond.y + playerSecond.height &&
            player.y + player.height > playerSecond.y;

        if (collsion) {
            let hitManger = 220;
            const playerHead = player.y;
            const playerSecondBottom = playerSecond.y + playerSecond.height - hitManger;

            const playerHitSecondPlayer = playerHead < playerSecondBottom;

            if (playerHitSecondPlayer) {
                this.game.state = 'gameOver';
                this.gameOverMusic.play();
            }
        }

        // --- Landing-Sound ---
        const currentlyOnGround = this.isOnGround();

        if (currentlyOnGround && this.wasInAir) {
            this.feedLanding.currentTime = 0;
            this.feedLanding.play();
        }

        // Zustand für nächsten Frame merken
        this.wasInAir = !currentlyOnGround;

        // Sprite Animation
        this.frameTimer += dt;

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer -= this.frameInterval;

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
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