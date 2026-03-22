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

    // Titel
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.font = "italic small-caps 600 200px Montserrat";
    context.fillStyle = '#aa1313ff';
    context.fillText('Spiel-Regeln 📜', this.width / 2, this.height / 2 - 900);

    // Regel 1
    context.font = "italic small-caps 600 65px Montserrat";
    context.fillStyle = '#8d6715ff';
    context.fillText('• Du hast 5 Herzen (Leben)', this.width / 2, this.height / 2 - 650);

    // Regel 2
    context.fillText('• Du verlierst ein Herz, wenn du von Gegnern getroffen wirst', this.width / 2, this.height / 2 - 550);

    // Regel 3
    context.fillText('• Treffer entstehen durch:', this.width / 2, this.height / 2 - 450);

    context.fillText('  - JuliePie (Enemy)', this.width / 2, this.height / 2 - 370);
    context.fillText('  - EnemyTwo', this.width / 2, this.height / 2 - 280);
    context.fillText('  - Caney-Flieger', this.width / 2, this.height / 2 - 200);

    // Regel 4
    context.fillText('• Nach einem Treffer bist du 3 Sekunden unverwundbar', this.width / 2, this.height / 2 - 100);

    // Regel 5
    context.fillText('• Währenddessen blinkt dein Charakter', this.width / 2, this.height / 2 - 20);

    // Regel 6
    context.fillText('• Ziel: Springe auf Gegner, um Punkte zu sammeln', this.width / 2, this.height / 2 + 80);

    // Regel 7
    context.fillText('• +5 Punkte pro erfolgreichem Treffer', this.width / 2, this.height / 2 + 160);

    // Regel 8 (Double Hit)
    context.fillText('• Triffst du zwei Gegner gleichzeitig:', this.width / 2, this.height / 2 + 240);

    context.fillText('  - +10 Punkte', this.width / 2, this.height / 2 + 310);
    context.fillText('  - kein Schaden', this.width / 2, this.height / 2 + 370);
    context.fillText('  - kein Herzverlust', this.width / 2, this.height / 2 + 430);

    // Regel 9
    context.fillText('• Bei 0 Herzen = Game Over', this.width / 2, this.height / 2 + 510);

    // Regel 10
    context.fillText('• Bei 300 Punkten hast du gewonnen', this.width / 2, this.height / 2 + 600);

    // Zurück
    context.font = "italic small-caps 600 80px Montserrat";
    context.fillStyle = '#43ee00ff';
    context.fillText('Drücke Q, um zurück zum Start zu kommen', this.width / 2, this.height / 2 + 700);

    // Abschluss
    context.font = "italic small-caps 600 130px Montserrat";
    context.fillStyle = '#660606ff';
    context.fillText('Viel Glück مَعَ ألٰسَّلَامَ 🚀🌈', this.width / 2, this.height / 2 + 850);
   }
}