// background.js
export class Background {
    constructor(game){
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.image = document.getElementById('background');
        this.x = 0;
        this.y = 0;
        this.speed = this.game.speed;
    }
 
    update(dt){
        
        // Optional: scrollenden Hintergrund machen
        this.x -= this.speed * dt;
        if (this.x <= -this.width) this.x = 0;
        
    }

    reset() {
        this.x = 0;
        this.y = 0;
    }

    draw(context){
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        // Für Endlos-Scroll:
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    } 
}
