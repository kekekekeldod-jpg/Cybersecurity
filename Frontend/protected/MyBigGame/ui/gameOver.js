export class GameOver{
    constructor(game){
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.image = document.getElementById('gameOverBackground');
        this.x = 0;
        this.y = 0;

    }

    draw(context){
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // Titel oben mittig
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 200px Montserrat";
        context.fillStyle = '#ff0000ff';
        context.fillText('﷽', this.width / 2, 100);

        // Hinweis unten mittig
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.font = 'italic normal 600 170px Arial';
        context.fillStyle = '#770443';
        context.fillText('Klicke Enter zum Neustart', this.width / 2, this.height - 150);
    }
}