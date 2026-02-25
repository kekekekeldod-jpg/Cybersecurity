// Mein erstes Spiel – Snake

(function () {
  function initGameCanvas() {
    // Canvas und Context holen
    const canvas = document.getElementById('canvas');
    if (!canvas) return; // Falls kein Canvas existiert

    const ctx = canvas.getContext('2d');

    // --- Spielfeld- und Spielvariablen ---
    let SIZE = 0;          // Spielfeldgröße (wird dynamisch gesetzt)
    let GRID_SIZE = 0;     // Größe eines Rasters (z.B. 15px)

    let direction = 1;     // aktuelle Richtung (1 = rechts, -1 = links, 2 = runter, -2 = hoch)
    let newDirection = 1;  // „geplante“ Richtung (wird über Input geändert)
    let snakeLength = 5;   // Startlänge der Schlange
    let snake = [];        // Array mit Segmenten: [{x, y}, ...]
    let foods = [];        // Essen-Koordinaten: [{x, y}, ...]
    let end = false;       // true, wenn Game Over
    let points = 0;        // Punktestand
    let gameStarted = false;
    let gameOverMusicPlayed = false;
    let actionBugger = false;

    // Audio
    const startSound = new Audio('audios/start-music.mp3');
    const gameOverSound = new Audio('audios/game-over.mp3');

    // Canvas-Init-Flag
    let canvasInitialized = false;

    // --- Hilfsfunktionen ---

    // Check: ist gerade ein Input-Feld aktiv?
    function isInputFocused() {
      const activeElement = document.activeElement;
      if (!activeElement) return false;

      const tag = activeElement.tagName;
      const type = activeElement.type;

      if (tag === 'INPUT') {
        return ['text', 'password', 'email', 'tel', 'search', 'number'].includes(type);
      }
      if (tag === 'TEXTAREA') return true;

      return false;
    }

    // Koordinate → String, z.B. {x: 100, y: 40} → "100,40"
    function coordToString(obj) {
      return [obj.x, obj.y].join(',');
    }

    // Zufällige Position auf dem Raster erzeugen (eine Achse)
    function randomFood() {
      const cellsPerRow = SIZE / GRID_SIZE;              // z.B. 600 / 15 = 40 Zellen
      const index = Math.floor(Math.random() * cellsPerRow); // 0–39
      return index * GRID_SIZE;                          // wieder in Pixel umrechnen
    }

    // Startsound abspielen (aber nur, solange Game Over Musik noch nicht lief)
    function playStartSound() {
      if (!gameOverMusicPlayed) {
        // nicht immer wieder neu starten, nur sicherstellen dass er spielt
        if (startSound.paused) {
          startSound.currentTime = 0;
          startSound.play().catch(() => {});
        }
      }
    }

    // Game-Over Sound abspielen
    function playGameOverSound() {
      startSound.pause();
      startSound.currentTime = 0;
      if (!gameOverMusicPlayed) {
        gameOverMusicPlayed = true;
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => {});
      }
    }

    // Spielzustand zurücksetzen (für Spielstart & Neustart)
    function resetGameState() {
      end = false;
      points = 0;
      snakeLength = 5;
      direction = newDirection = 1;
      gameOverMusicPlayed = false;
      gameOverSound.currentTime = 0;
      gameOverSound.pause();
      foods = [];

      // Schlange in die Mitte setzen
      snake = [{ x: SIZE / 2, y: SIZE / 2 }];
    }

    // Canvas-Größe und Skalierung an Bildschirm anpassen
    function adjustCanvasSize() {
      // Mobile vs Desktop
      const smallScreen = window.innerWidth <= 720 || window.innerHeight <= 576;
      SIZE = smallScreen ? 200 : 600;

      // Anzahl Rasterfelder (hier 40) → GRID_SIZE = Größe einer Kachel
      GRID_SIZE = SIZE / 40;

      const scale = 2; // einfache 2x-Skalierung (kannst du mit devicePixelRatio ersetzen)

      // Physische Canvas-Größe (für schärfere Darstellung)
      canvas.width = canvas.height = SIZE * scale;
      // Sichtbare CSS-Größe
      canvas.style.width = canvas.style.height = SIZE + 'px';

      // Transform zurücksetzen und neu skalieren
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      // Beim allerersten Aufruf: Spielzustand initialisieren
      if (!canvasInitialized) {
        canvasInitialized = true;
        resetGameState();
      }
    }

    // --- Haupt-Spielschleife ---
    function tick() {
      if (!canvasInitialized) {
        adjustCanvasSize();
      }

      // Startscreen zeichnen, wenn Spiel noch nicht gestartet
      if (!gameStarted) {
        ctx.fillStyle = '#22424a';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = '#da8d12';
        ctx.textAlign = 'center';

        if (window.innerWidth <= 720 || window.innerHeight <= 576) {
          ctx.font = '11px Monospace';
          ctx.fillText('Drücke eine beliebige Taste,', SIZE / 2, SIZE / 2);
          ctx.fillText('um das Spiel zu starten', SIZE / 2, SIZE / 2 + 20);
        } else if (navigator.userAgent.match(/iPad|Macintosh/i)) {
          ctx.font = '26px Monospace';
          ctx.fillText('Swipe in eine beliebige Richtung,', SIZE / 2, SIZE / 2);
          ctx.fillText('um das Spiel zu starten', SIZE / 2, SIZE / 2 + 40);
        } else {
          ctx.font = '30px Monospace';
          ctx.fillText('Drücke die Leertaste,', SIZE / 2, SIZE / 2);
          ctx.fillText('um das Spiel zu starten', SIZE / 2, SIZE / 2 + 40);
        }
        return;
      }

      // Wenn Game Over → Game-Over-Screen + Sound
      if (end) {
        playGameOverSound();
        ctx.fillStyle = '#22424a';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#da8d12';
        ctx.textAlign = 'center';

        if (window.innerWidth <= 720 || window.innerHeight <= 576) {
          ctx.font = '10px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Drücke eine Taste zum Neustart', SIZE / 2, SIZE / 2 + 20);
        } else if (navigator.userAgent.match(/iPad|Macintosh/i)) {
          ctx.font = '26px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Swipe für Neustart', SIZE / 2, SIZE / 2 + 40);
        } else {
          ctx.font = '27px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Drücke die Taste B für Neustart', SIZE / 2, SIZE / 2 + 40);
        }
        return;
      }

      // Wenn wir hier sind: Spiel läuft normal
      playStartSound();

      // Hintergrund zeichnen
      ctx.fillStyle = '#22424a';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Neue Kopfposition berechnen
      const head = { x: snake[0].x, y: snake[0].y };

      // Richtungswechsel nur erlauben, wenn nicht direkt um 180° gedreht wird
      if (Math.abs(direction) !== Math.abs(newDirection)) {
        direction = newDirection;
      }

      const axis = Math.abs(direction) === 1 ? 'x' : 'y';

      if (direction < 0) {
        head[axis] -= GRID_SIZE; // links oder hoch
      } else {
        head[axis] += GRID_SIZE; // rechts oder runter
      }

      // Essen getroffen?
      for (let i = 0; i < foods.length; i++) {
        if (foods[i].x === head.x && foods[i].y === head.y) {
          foods.splice(i, 1);
          snakeLength += 3;
          points += 5;
          break;
        }
      }

      // Kopf an den Anfang der Schlange
      snake.unshift(head);
      // Länge begrenzen
      snake = snake.slice(0, snakeLength);

      // Rand-Kollision prüfen
      if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE) {
        end = true;
      }

      // Snake zeichnen + Selbstkollision prüfen
      const snakeObj = {};
      ctx.fillStyle = 'rgba(183, 255, 0, 0.33)';

      for (let i = 0; i < snake.length; i++) {
        const part = snake[i];
        ctx.fillRect(part.x, part.y, GRID_SIZE - 1, GRID_SIZE - 1);
        if (i > 0) {
          snakeObj[coordToString(part)] = true;
        }
      }

      // Selbstkollision: Kopf in snakeObj?
      if (snakeObj[coordToString(head)]) {
        end = true;
      }

      // Essen nachspawnen, bis 5 Stück da sind
      while (foods.length < 5) {
        const newFood = { x: randomFood(), y: randomFood() };

        // Optional: verhindern, dass Essen IN der Schlange spawnt
        if (!snakeObj[coordToString(newFood)] && coordToString(newFood) !== coordToString(head)) {
          foods.push(newFood);
        }
      }

      // Essen zeichnen
      ctx.fillStyle = 'red';
      for (let i = 0; i < foods.length; i++) {
        ctx.fillRect(foods[i].x, foods[i].y, GRID_SIZE, GRID_SIZE);
      }

      // Punkte zeichnen
      ctx.fillStyle = '#d90082';
      ctx.textAlign = 'left';

      if (window.innerWidth <= 720) {
        ctx.font = '10px Monospace';
        ctx.fillText('Punkte: ' + points, 10, 14);
      } else {
        ctx.font = '20px Monospace';
        ctx.fillText('Punkte: ' + points, 20, 30);
      }
    }

    // --- Input-Behandlung ---

    function handleKeyAction(action){
      switch (action) {
          case 'up':    newDirection = -2; break;
          case 'down':  newDirection =  2; break;
          case 'left':  newDirection = -1; break;
          case 'right': newDirection =  1; break;
    }
}


    // Keyboard-Events
   window.addEventListener('keydown', function (e) {
  if (isInputFocused()) return;

  // verhindert Scrollen durch Space (aber kein Restart hier!)
  if (e.code === 'Space') {
    e.preventDefault();
    return;
  }

  const keyToAction = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const action = keyToAction[e.key];
  if (action) {
    e.preventDefault();
    if (end) return;          // optional: keine Richtungswechsel im Endscreen
    handleKeyAction(action);
    actionBugger = true;
  }
});

window.addEventListener('keydown', function (e) {
  if (isInputFocused()) return;
  if (e.code !== 'Space') return;

  e.preventDefault();

  // Start oder Neustart erst beim Loslassen der Space-Taste
  if (!gameStarted) {
    gameStarted = true;
    resetGameState();
    return;
  }
});

window.addEventListener('keydown', function (e) {
  if (isInputFocused()) return;
  if (e.code !== 'KeyB') return;

  e.preventDefault();

  if(end){
    resetGameState();
    return;
  }
});

    // Button-Steuerung (Pfeile in HTML)
    const upBtn = document.querySelector('.up');
    const downBtn = document.querySelector('.down');
    const leftBtn = document.querySelector('.left');
    const rightBtn = document.querySelector('.right');

    upBtn && upBtn.addEventListener('click', () => handleKeyAction('up'));
    downBtn && downBtn.addEventListener('click', () => handleKeyAction('down'));
    leftBtn && leftBtn.addEventListener('click', () => handleKeyAction('left'));
    rightBtn && rightBtn.addEventListener('click', () => handleKeyAction('right'));

    // Fenster-Resize
    window.addEventListener('resize', function () {
      adjustCanvasSize();
    });

    // Start: Canvas anpassen + Spielschleife starten
    adjustCanvasSize();
    setInterval(tick, 100);
  }

  window.addEventListener('load', initGameCanvas);
})();