export class Info {
    constructor(game){
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.x = 0;
        this.y = 0;
        this.image = document.getElementById('infoBackground');
    }

    draw(context){
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        //Info Erklärung
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 200px Montserrat";
        context.fillStyle = '#aa1313ff';
        context.textAlign = 'top';
        context.fillText('Spiel-Regeln 📜', this.width / 2, this.height / 2 - 800);

        //Regel 1.
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('• Spiel endet sofort (= Game Over), wenn der Spieler die linke oder rechte Seite des Canvas berührt', this.width / 2, this.height / 2 - 550)
  
        //Regel 2.
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('• Spiel endet ebenfalls, wenn der Spieler auf der X-Achse von JuliPie (dem Monster) getroffen wird', this.width / 2, this.height / 2 - 400)

        //Regel 3.
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText(' • Der Spieler stirbt außerdem, wenn er vom zweiten Gegner (Caney-Flieger) getroffen wird', this.width / 2, this.height / 2 - 250)

        //Regel 4.
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('• Ziel des Spiels ist es, möglichst oft über den Kopf von JuliPie zu springen', this.width / 2, this.height / 2 - 100)

          //Regel 5.
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText(' • Jeder erfolgreiche Sprung über JuliPie, ohne getroffen zu werden, bringt Punkte', this.width / 2, this.height / 2 + 50)

        //Regel 5.1
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText(' • Trifft man beide auf einmal, dann sind es Double-Punkte', this.width / 2, this.height / 2 + 150)

        //Regel 6.1
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('• Punkte erhöhen sich, solange der Spieler nicht:', this.width / 2, this.height / 2 + 250)

         //Regel 6.2
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('die Seitenbegrenzung berührt,', this.width / 2, this.height / 2 + 350)

        //Regel 6.3
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('von JuliPie (dem Monster) getroffen wird oder', this.width / 2, this.height / 2 + 450)

         //Regel 6.4
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('vom Caney-Flieger getroffen wird', this.width / 2, this.height / 2 + 550)

         //Regel 7
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 55px Montserrat";
        context.fillStyle = '#8d6715ff';
        context.textAlign = 'top';
        context.fillText('• Bei 300 P hast du gewonnen', this.width / 2, this.height / 2 + 640)

          //Q-Zurück
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 80px Montserrat";
        context.fillStyle = '#43ee00ff';
        context.textAlign = 'top';
        context.fillText('Klicke die q-Taste, um zurück auf Start zu kommen', this.width / 2, this.height / 2 + 710)

         //Glückwunsch
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = "italic small-caps 600 130px Montserrat";
        context.fillStyle = '#660606ff';
        context.textAlign = 'top';
        context.fillText('Viel Glück مَعَ ألٰسَّلَامَ 🚀🌈', this.width / 2, this.height / 2 + 850)
    }
}