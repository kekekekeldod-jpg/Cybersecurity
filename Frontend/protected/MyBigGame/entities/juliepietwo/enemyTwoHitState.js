export class Hit {
    constructor(enemyTwo){
        this.enemy = enemyTwo;
        this.enemy.frameX = 0;
        this.enemy.frameY = 0;
        this.enemy.maxFrame = 9;

        this.enemy.frameTimer = 0;
    }

    enter(){
       this.enemy.frameY = 1;
       this.enemy.frameX = 0;
       this.enemy.maxFrame = 9;
       this.enemy.frameTimer = 0;
    }

    update(dt){

        this.enemy.frameTimer += dt;
        if (this.enemy.frameTimer > this.enemy.frameInterval) {
            this.enemy.frameTimer -= this.enemy.frameInterval;
            if (this.enemy.frameX < this.enemy.maxFrame) {
                this.enemy.frameX++;
            } else {
                this.enemy.reset();
                this.enemy.state = 'ALIVE';
                this.enemy.frameX = 0;
                this.enemy.frameY = 0;
            }
        }
    }
}