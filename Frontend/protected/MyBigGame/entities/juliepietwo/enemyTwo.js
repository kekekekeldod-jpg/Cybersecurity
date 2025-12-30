import { Hit } from "./enemyTwoHitState.js";

export class EnemyTwo {
    constructor(game){
        this.game = game;
        this.player = this.game.player;
        this.enemy = this.game.enemy;
        this.width = 500;
        this.height = 500;
        this.x = 0;
        this.y = this.game.height - this.height;
        this.image = document.getElementById('enemyTwo');
         this.speed = 600;

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 9;
        this.fps = 14;
        this.frameInterval = 1 / this.fps;
        this.frameTimer = 0;
        this.gameOverMusic = this.game.gameOverMusic;
        this.runningMusic = this.game.runningMusic;

        this.state = 'ALIVE';

        this.hitMusic = this.game.hitMusic;

        this.hitState = new Hit(this);

}
    reset(){
        this.x = 0;
        this.y = this.game.height - this.height;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 9;
    }

    update(dt) {
        if (this.state === 'HIT') {
            this.hitState.update(dt);
            return;
        }

     // Bewegung des Spielers
     this.x += this.speed * dt;

     //Punkte 
     const punkte = this.game.score;

    //Kollision = Game 
    const player = this.game.player;

    const collsion = 
    player.x < this.x + this.width &&
    player.x + player.width > this.x &&
    player.y < this.y + this.height &&
    player.y + player.height > this.y;

    if (collsion && this.state === 'ALIVE') {
 
        const playerBottom = player.y + player.height;
        const enemyTop = this.y;

        const hitOver = playerBottom <= enemyTop + this.height * 0.9 &&
        player.vy > 0;


        if(hitOver) {
            player.vy = player.jumpStrengthAfterHit;
            punkte.scoreState += 5;
            this.state = 'HIT';
            this.hitState.enter();
            this.hitMusic.pause();
            this.hitMusic.currentTime = 0;
            this.hitMusic.play();

            this.game.playerHitFromTop = true;

        } else {
            this.game.playerHitFromSide = true;
        }

    }

    // Wiederhollen des Enemys

    if (this.x - this.width >= this.game.width) this.x = 0 - this.width;

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


    draw(context){
          context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
}


}