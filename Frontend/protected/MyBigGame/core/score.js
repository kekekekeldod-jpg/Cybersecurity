export class Score {
    constructor(game) {
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;

        this.x = 0;
        this.y = 0;

        this.scoreState = 0;
        this.maxScore = 300;

        // Smooth Progress (Anzeige-Wert, läuft weich hinterher)
        this.displayProgress = 0; // 0..1
        this.smoothSpeed = 0.1;   // höher = schneller, z.B. 0.05 bis 0.2

        // Bar-Layout
        this.barX = this.width / 2 - 450;
        this.barY = 30;
        this.barWidth = 800;
        this.barHeight = 50;
    }

    reset() {
        this.scoreState = 0;
        this.displayProgress = 0;
    }

    // 0..1 (praktisch für Balken)
    getProgress01() {
        return Math.min(this.scoreState / this.maxScore, 1);
    }

    // 0..100
    getScorePercent() {
        return this.getProgress01() * 100;
    }

    // pro Frame aufrufen
    update() {
        const target = this.getProgress01();
        this.displayProgress += (target - this.displayProgress) * this.smoothSpeed;
    }

    drawBar(context) {
        const p = this.displayProgress; // 0..1

        // Hintergrund
        context.fillStyle = '#2b2b2b';
        context.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);

        // Füllung
        context.fillStyle = '#c22';
        context.fillRect(this.barX, this.barY, this.barWidth * p, this.barHeight);

        // Rahmen
        context.strokeStyle = '#675df7ff';
        context.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);

        // Prozent-Text rechts neben dem Balken
        context.fillStyle = '#790c0cff';
        context.font = ' 900 70px Montserrat';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText((p * 100).toFixed(2) + '%', this.barX + this.barWidth + 12, this.barY + this.barHeight / 2);
    }

    draw(context) {
        // Text
        const percentText = this.getScorePercent().toFixed(2);

        context.fillStyle = '#790c0cff';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = "italic small-caps 800 70px Montserrat";
        context.fillText('Score: ' + this.scoreState, 20, 30);
        // Balken
        this.drawBar(context);

        context.fillStyle = '#790c0cff';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = "italic small-caps 800 70px Montserrat";
        context.fillText('Gewonnen bei 300P', 18, 110);


    }
}
