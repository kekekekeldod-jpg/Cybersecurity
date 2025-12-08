export class Score {
    constructor(game){
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.x = 0;
        this.y = 0;
        this.scoreState = 0;
    }

    reset(){
        this.scoreState = 0;
    }

    draw(context){
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 70px Montserrat";
        context.fillStyle = '#790c0cff';
        context.textAlign = 'top';
        context.fillText('Score:' + this.scoreState, 20, 30)
    }
}