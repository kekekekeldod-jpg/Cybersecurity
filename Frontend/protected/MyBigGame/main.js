// main.js
import { InputHandler } from "./input.js";
import { Player } from "./player.js"; 
import { Background } from "./background.js";
import { Start } from "./start.js";
import { GameOver } from "./gameOver.js";
import { PlayerFish} from "./player2.js";
import { setupMobileControls } from "./inputSmartphone.js";
import { Enemy } from "./enemy.js";

// Fixe "Game-Welt"-Größe (logische Auflösung)
const DESIGN_WIDTH = 3000;
const DESIGN_HEIGHT = 2000;
 
window.addEventListener('load', function () {

       // Smartphone-Steuerung initialisieren    
       setupMobileControls();  
       
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let scale = 1;  

    function resizeCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const scaleX = w / DESIGN_WIDTH;
        const scaleY = h / DESIGN_HEIGHT;

        // Kleineren Faktor nehmen, damit nichts abgeschnitten wird
        scale = Math.min(scaleX, scaleY);

         canvas.width = DESIGN_WIDTH * scale; 
         canvas.height = DESIGN_HEIGHT * scale;
    }

    resizeCanvas();
    this.window.addEventListener('resize', resizeCanvas);

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 0;
            this.heavyMargin = 100;
            this.speed = 3;
            this.backgroundMusic = new Audio('./MyBigGame/audios/backgroundMusic.mp3');
            this.backgroundMusic.loop = true;     
            this.backgroundMusic.volume = 1;

            this.gameOverMusic = new Audio('./MyBigGame/audios/gameOverMusic.mp3');
            this.gameOverMusic.volume = 1;
            this.jumpMusic = new Audio('./MyBigGame/audios/jumpMusic.mp3');
            this.jumpMusic.volume = 1;
            this.feedLanding = new Audio('./MyBigGame/audios/feedLanding.mp3');
            this.jumpMusic.volume = 1;
            this.runningMusic = new Audio('./MyBigGame/audios/running.mp3');
            this.runningMusic.loop = true;
            this.runningMusic.volume = 0.4;
            this.hitMusic = new Audio('././MyBigGame/audios/hitMusic.mp3');
            this.hitMusic.volume = 1;

            // 'start' | 'playing' | 'gameOver'
            this.state = 'start';

            this.input = new InputHandler();
            this.player = new Player(this);
            this.playerFish = new PlayerFish(this);
            this.background = new Background(this);
            this.startScreen = new Start(this);
            this.gameOverScreen = new GameOver(this);
            this.enemy = new Enemy(this);
        }

        update(deltaTime) {

            // Q = Startbildschirn

            if (this.input.keys.includes('q')) {
                this.goToStart();
                return;
            }

            // START SCREEN
            if (this.state === 'start') {
                if (this.input.keys.includes('Enter')) {
                    this.state = 'playing';
                }
                return; // sonst nix
            }

            // GAME OVER → nix mehr bewegen, optional Restart
            if (this.state === 'gameOver') {
                if (this.input.keys.includes('Enter')) {
                    this.restart();
                }
                return;
            }

            // PLAYING
            if (this.state === 'playing') {
                 this.gameOverMusic.pause();
                 this.backgroundMusic.play();
                 this.background.update(deltaTime);
                 this.playerFish.update(deltaTime);
                 this.player.update(this.input.keys, deltaTime);
                 this.enemy.update(deltaTime);
                
            }
        }

        
        draw(context) {
            if (this.state === 'start') {
                this.startScreen.draw(context);
                return;
            }

            this.background.draw(context);
            this.enemy.draw(context);
            this.playerFish.draw(context);
            this.player.draw(context);

            if (this.state === 'gameOver') {
                this.gameOverScreen.draw(context);
                this.backgroundMusic.pause();
                this.runningMusic.pause();
                this.hitMusic.pause();
            }
        }

         restart() {
            console.log('RESTART');
            this.gameOverMusic.currentTime = 0;
            this.enemy.reset();
            this.playerFish.reset();
            this.player.reset();
            this.background.reset();
            this.state = 'playing';
            console.log('STATE NACH RESTART:', this.state, this.player.x, this.player.y);
        }

        goToStart(){
            this.backgroundMusic.pause();
            this.feedLanding.pause();
            this.gameOverMusic.pause();
            this.jumpMusic.pause();
            this.runningMusic.pause();
            
            this.restart();

            this.state = 'start';
        }

    }
    

    const game = new Game(DESIGN_WIDTH, DESIGN_HEIGHT);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        // kompletten Kontext skalieren
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

          // in Game-Koordinaten (3000x2000) wischen
        ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

        game.update(deltaTime);
        game.draw(ctx);

        ctx.restore();
        
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});
