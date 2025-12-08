export class Start {
    constructor(game) {
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.image = document.getElementById('startBackground');
        this.x = 0;
        this.y = 0;
    }

   draw(context){
 
 
        // Hintergrund
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        //Überschirft 
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 200px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('مَرْدُوٓ هَكَرٰ ﷻ', this.width / 2, this.height / 2 - 850);


        //Q-Erklärung 
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 50px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'right';
        context.fillText('Klicke die q-Taste, um wieder auf', this.width / 2 - 600, this.height / 2 - 500);
        context.fillText('den Start-Screen zurückzukommen', this.width / 2 - 565, this.height / 2 - 450);

         //I-Erlärung 
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 50px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'left';
        context.fillText('Klicke die i-Taste, um die Regeln des', this.width / 2 + 550, this.height / 2 - 500);
        context.fillText('Spieles zu lesen und zu kennen', this.width / 2 + 550, this.height / 2 - 450);


        // Untertitel
        context.textAlign = 'center';
        context.textBaseline = 'middle';   // y-Koordinate ist Mitte des Textes
        context.font = "italic small-caps 600 200px Montserrat";
        context.fillStyle = '#266d74ff';
        context.textAlign = 'center';
        context.fillText('Merdo of Caney', this.width / 2, this.height / 2 - 50);

        // Hinweis
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = 'italic normal 600 170px Arial';
        context.fillStyle = '#770443';
        context.fillText('Klicke Enter zum Start ', this.width / 2, this.height / 2 + 600);
    }
};