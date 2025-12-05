import { Hit } from "./enemyHitState.js";

export class Enemy {

    constructor(game){
        this.game = game;
        this.width = 500;
        this.height = 500;
        this.image = document.getElementById('enemy');
        this.x = this.game.width - this.width;
        this.y = this.game.height - this.height;
        this.speed = 10;

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 9;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.gameOverMusic = this.game.gameOverMusic;
        this.runningMusic = this.game.runningMusic;

        this.state = 'ALIVE';

        this.hitMusic = this.game.hitMusic;

        this.hitState = new Hit(this);
    }

    reset(){
        this.x = this.game.width - this.width;
        this.y = this.game.height - this.height;
    }

    update(deltaTime) {

        if (this.state === 'HIT') {
            this.hitState.update(deltaTime);
            return;
        }


     // Bewegung des Spielers
     this.x -= this.speed;


    //Kollision = Game 
    const player = this.game.player;

    const collsion = 
    player.x < this.x + this.width &&
    player.x + player.width > this.x &&
    player.y < this.y + this.height &&
    player.y + player.height > this.y;

    if (collsion) {

        const playerBottom = player.y + player.height;
        const enemyTop = this.y;

        const hitOver = playerBottom <= enemyTop + this.height * 0.9 &&
        player.vy > 0;

        const onlyHeadMusic = playerBottom <= enemyTop + this.height;


        if(hitOver && this.state === 'ALIVE') {
            player.vy = -30;
            this.state = 'HIT';
            this.hitMusic.play();
            this.hitState.enter();

        } else {
            this.game.state = 'gameOver';
            this.gameOverMusic.play();
            this.hitMusic.pause();
        }

        if (onlyHeadMusic) {
        this.hitMusic.play();
        this.hitMusic.currentTime = 0;
        }
    }

   



    // Wiederhollen des Enemys

    if (this.x <= -this.width) this.x = this.game.width - this.width;

          // Sprite Animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
    }


    draw(context){
          context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
}

}