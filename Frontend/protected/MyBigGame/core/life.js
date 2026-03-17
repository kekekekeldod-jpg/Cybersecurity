export class Life {
    constructor(game){
        this.game = game;
        this.player = this.game.player;
        this.frameWidth = 200;
        this.frameHeight = 100;
        this.marginLife = 50;
        this.x = this.game.width - 250;
        this.y = 0 + this.marginLife;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrameX = 7;
        this.maxFrameY = 5;
        this.fps = 12;
        this.frameInterval = 1 / this.fps;
        this.frameTimer = 0;
        this.image = document.getElementById('heart');
    }

    reset(){
        this.frameY = 0;
        this.frameX = 0;
    }

    update(dt){

          // Sprite Animation
        this.frameTimer += dt;

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer -= this.frameInterval;

            if (this.frameX < this.maxFrameX) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
    }

    loseHeart(){
        if (this.frameY < this.maxFrameY){
            this.frameY++;
        }

        if (this.frameY >= this.maxFrameY){
            this.game.state = 'gameOver';
            this.game.backgroundMusic.pause();
            this.game.gameOverMusic.currentTime = 0;
            this.game.gameOverMusic.play();
        }

    }

   
    draw(context){
          context.drawImage(this.image, this.frameX * this.frameWidth, this.frameY * this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.frameWidth, this.frameHeight);
    }

}