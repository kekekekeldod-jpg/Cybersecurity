export class Hit {
    constructor(enemy){
        this.enemy = enemy;
        this.enemy.frameX = 0;
        this.enemy.frameY = 0;
        this.enemy.maxFrame = 9;
    }

    enter(){
       this.enemy.frameY = 1;
       this.enemy.frameX = 0;
       this.enemy.maxFrame = 9;
       this.enemy.frameTimer = 0;
    }

    update(deltaTime){

        this.enemy.frameTimer += deltaTime;
        if (this.enemy.frameTimer > this.enemy.frameInterval) {
            this.enemy.frameTimer = 0;
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