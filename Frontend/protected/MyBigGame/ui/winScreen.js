export class WinScreen{
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = this.game.width;
        this.heigt = this.game.height;
        this.image = document.getElementById('winnerImage');
    }

    draw(context){
        context.drawImage(this.image, this.x, this.y, this.width, this.heigt);

        context.textAlign = 'center';
        context.textBaseline = 'middel';
        context.font = "italic small-caps 900 100px Montserrat";
        context.fillStyle = '#047c44ff';
        context.textAlign = 'top';
        context.fillText('Herzlichen Glückwunsch, du hast gewonnen', this.width / 2, this.heigt /2 - 800);

        context.textAlign = 'center';
        context.textBaseline = 'middel';
        context.font = "italic small-caps 900 100px Montserrat";
        context.fillStyle = '#971313ff';
        context.textAlign = 'top';
        context.fillText('Drücke auf die G-Taste, um auf Start zu kommen', this.width / 2, this.heigt /2);

        context.textAlign = 'center';
        context.textBaseline = 'middel';
        context.font = "italic small-caps 900 100px Montserrat";
        context.fillStyle = '#87ee00ff';
        context.textAlign = 'top';
        context.fillText('Viel Glück erneut!', this.width / 2, this.heigt /2 + 800);
    }
}