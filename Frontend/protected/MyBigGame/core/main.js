// main.js
import { InputHandler } from "../input/input.js";
import { Player } from "../entities/merdonis/player.js"; 
import { Background } from "../core/background.js";
import { Start } from "../ui/start.js";
import { GameOver } from "../ui/gameOver.js";
import { PlayerFish} from "../entities/caneyflieger/player2.js";
import { setupMobileControls } from "../input/inputSmartphone.js";
import { Enemy } from "../entities/juliepie/enemy.js";
import { Info } from "../ui/info.js";
import { Score } from "../core/score.js";
import { EnemyTwo } from "../entities/juliepietwo/enemyTwo.js";

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
            this.speed = 200;
            this.playerHitFromTop = false;
            this.playerHitFromSide = false;
            this.backgroundMusic = new Audio('./MyBigGame/assets/audios/backgroundMusic.mp3');
            this.backgroundMusic.loop = true;     
            this.backgroundMusic.volume = 1;

            this.gameOverMusic = new Audio('./MyBigGame/assets/audios/gameOverMusic.mp3');
            this.gameOverMusic.volume = 1;
            this.jumpMusic = new Audio('./MyBigGame/assets/audios/jumpMusic.mp3');
            this.jumpMusic.volume = 1;
            this.feedLanding = new Audio('./MyBigGame/assets/audios/feedLanding.mp3');
            this.jumpMusic.volume = 1;
            this.runningMusic = new Audio('./MyBigGame/assets/audios/running.mp3');
            this.runningMusic.loop = true;
            this.runningMusic.volume = 0.4;
            this.hitMusic = new Audio('././MyBigGame/assets/audios/hitMusic.mp3');
            this.hitMusic.volume = 1;

            this.isBackgroundMusic = false;

            // 'start' | 'playing' | 'gameOver'
            this.state = 'start';

            this.input = new InputHandler();
            this.player = new Player(this);
            this.playerFish = new PlayerFish(this);
            this.background = new Background(this);
            this.startScreen = new Start(this);
            this.gameOverScreen = new GameOver(this);
            this.enemy = new Enemy(this);
            this.enemyTwo = new EnemyTwo(this);
            this.info = new Info(this);
            this.score = new Score(this);
        }

        playBackgroundMusicOnce() {
            if (!this.isBackgroundMusicPlaying) {
                const p = this.backgroundMusic.play();
                if (p && p.catch) p.catch(() => {});
                this.isBackgroundMusicPlaying = true;
            }
        }

        pauseBackgroundMusic() {
            if (this.isBackgroundMusicPlaying) {
                this.backgroundMusic.pause();
                this.isBackgroundMusicPlaying = false;
            }
        }

        update(dt) {

            // i = InfoScreen
            if (this.input.keys.includes('i')){
                this.infoScreen();
                return;
            }

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
                
                 this.playBackgroundMusicOnce();

                 this.playerHitFromTop = false;
                 this.playerHitFromSide = false; 

                 this.background.update(dt);
                 this.playerFish.update(dt);
                 this.player.update(this.input.keys, dt);
                 this.enemy.update(dt);
                 this.enemyTwo.update(dt);

                 if (this.playerHitFromSide && !this.playerHitFromTop) {
                    this.state = 'gameOver';
                    this.backgroundMusic.pause();
                    this.gameOverMusic.currentTime = 0;
                    this.gameOverMusic.play();
                 }

                 if(this.playerHitFromSide && this.playerHitFromTop){
                    this.enemy.hitState.enter();
                    this.enemyTwo.hitState.enter();
                    this.enemy.state = 'HIT';
                    this.enemyTwo.state = 'HIT';
                    this.score.scoreState += 5;
                 } 
                
            }
        }

        
        draw(context) {

            if (this.state === 'info'){
                this.info.draw(context);
                return;
            }
            if (this.state === 'start') {
                this.startScreen.draw(context);
                return;
            }

            this.background.draw(context);
            this.enemy.draw(context);
            this.enemyTwo.draw(context);
            this.playerFish.draw(context);
            this.player.draw(context);
            this.score.draw(context);

            if (this.state === 'gameOver') {
                this.gameOverScreen.draw(context);
                this.pauseBackgroundMusic();
                this.runningMusic.pause();
                this.hitMusic.pause();
            }
        }

         restart() {
            console.log('RESTART');
            this.backgroundMusic.currentTime = 0;
            this.gameOverMusic.currentTime = 0;
            this.enemy.reset();
            this.enemyTwo.reset();
            this.playerFish.reset();
            this.player.reset();
            this.pauseBackgroundMusic();
            this.score.reset();
            this.state = 'playing';
            console.log('STATE NACH RESTART:', this.state, this.player.x, this.player.y);
        }

        goToStart(){
            this.backgroundMusic.currentTime = 0;
            this.gameOverMusic.currentTime = 0;
               this.pauseBackgroundMusic();
            this.feedLanding.pause();
            this.gameOverMusic.pause();
            this.jumpMusic.pause();
            this.runningMusic.pause();
            this.enemy.reset();
            this.enemyTwo.reset();
            this.playerFish.reset();
            this.player.reset();
            this.background.reset();
            this.score.reset();
            this.state = 'start';
        }

        infoScreen(){
            this.backgroundMusic.currentTime = 0;
            this.gameOverMusic.currentTime = 0;
            this.pauseBackgroundMusic();
            this.feedLanding.pause();
            this.gameOverMusic.pause();
            this.jumpMusic.pause();
            this.runningMusic.pause();
            this.enemy.reset();
            this.enemyTwo.reset();
            this.playerFish.reset();
            this.player.reset();
            this.background.reset();
            this.score.reset();
            this.state = 'info';
        }

    }
    

    const game = new Game(DESIGN_WIDTH, DESIGN_HEIGHT);
    let lastTime = 0;
    let accumulator = 0;

    const STEP = 1 / 60;
    const MAX_FRAME = 0.1;

    function animate(timeStamp) {

        let frameTime = (timeStamp - lastTime) / 1000;

        lastTime = timeStamp;

        if (frameTime > MAX_FRAME) frameTime = MAX_FRAME;

        accumulator += frameTime;

        while (accumulator >= STEP) {
            game.update(STEP);
            accumulator -= STEP;
        }

        // kompletten Kontext skalieren
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

          // in Game-Koordinaten (3000x2000) wischen
        ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        game.draw(ctx);

        ctx.restore();
        
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});