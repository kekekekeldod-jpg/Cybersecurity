// Mein erstes Spiel – Snake (FIXED: Mobile Buttons / Pointer Events / Input-Handling bereinigt)
(function () {
  function initGameCanvas() {
    // Canvas und Context holen
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // --- Spielfeld- und Spielvariablen ---
    let SIZE = 0;          // Spielfeldgröße (dynamisch)
    let GRID_SIZE = 0;     // Größe einer Kachel

    let direction = 1;     // 1 = rechts, -1 = links, 2 = runter, -2 = hoch
    let newDirection = 1;
    let snakeLength = 5;
    let snake = [];
    let foods = [];
    let end = false;
    let points = 0;
    let gameStarted = false;
    let gameOverMusicPlayed = false;

    // Audio
    const startSound = new Audio('audios/start-music.mp3');
    const gameOverSound = new Audio('audios/game-over.mp3');

    // Canvas-Init-Flag
    let canvasInitialized = false;

    // --- Hilfsfunktionen ---

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

    function coordToString(obj) {
      return [obj.x, obj.y].join(',');
    }

    function randomFood() {
      const cellsPerRow = SIZE / GRID_SIZE;
      const index = Math.floor(Math.random() * cellsPerRow);
      return index * GRID_SIZE;
    }

    function playStartSound() {
      if (!gameOverMusicPlayed && startSound.paused) {
        startSound.currentTime = 0;
        startSound.play().catch(() => {});
      }
    }

    function playGameOverSound() {
      startSound.pause();
      startSound.currentTime = 0;
      if (!gameOverMusicPlayed) {
        gameOverMusicPlayed = true;
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => {});
      }
    }

    function resetGameState() {
      end = false;
      points = 0;
      snakeLength = 5;
      direction = newDirection = 1;

      gameOverMusicPlayed = false;
      gameOverSound.pause();
      gameOverSound.currentTime = 0;

      foods = [];

      // Schlange in die Mitte setzen (auf Raster ausrichten)
      const mid = Math.floor((SIZE / 2) / GRID_SIZE) * GRID_SIZE;
      snake = [{ x: mid, y: mid }];
    }

    function adjustCanvasSize() {
      const smallScreen = window.innerWidth <= 720 || window.innerHeight <= 576;
      SIZE = smallScreen ? 200 : 600;

      GRID_SIZE = SIZE / 40;

      // Schärfer: devicePixelRatio nutzen (statt fix 2)
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

      canvas.width = canvas.height = SIZE * dpr;
      canvas.style.width = canvas.style.height = SIZE + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!canvasInitialized) {
        canvasInitialized = true;
        resetGameState();
      } else {
        // Wenn man resized: Schlange auf Raster halten
        const head = snake[0];
        head.x = Math.floor(head.x / GRID_SIZE) * GRID_SIZE;
        head.y = Math.floor(head.y / GRID_SIZE) * GRID_SIZE;
      }
    }

    // --- Input / Actions ---

    function handleKeyAction(action) {
      switch (action) {
        case 'up':    newDirection = -2; break;
        case 'down':  newDirection =  2; break;
        case 'left':  newDirection = -1; break;
        case 'right': newDirection =  1; break;
      }
    }

    // Jede "Eingabe" kann Start/Restart auslösen (praktisch auf Handy)
    function handleAnyInputStartOrRestart() {
      if (!gameStarted) {
        gameStarted = true;
        resetGameState();
        return true;
      }
      if (end) {
        resetGameState();
        return true;
      }
      return false;
    }

    // --- Haupt-Spielschleife ---
    function tick() {
      if (!canvasInitialized) adjustCanvasSize();

      // Startscreen
      if (!gameStarted) {
        ctx.fillStyle = '#22424a';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#da8d12';
        ctx.textAlign = 'center';

        if (window.innerWidth <= 720 || window.innerHeight <= 576) {
          ctx.font = '11px Monospace';
          ctx.fillText('Tippe Button / Taste,', SIZE / 2, SIZE / 2);
          ctx.fillText('um das Spiel zu starten', SIZE / 2, SIZE / 2 + 20);
        } else if (navigator.userAgent.match(/iPad|Macintosh/i)) {
          ctx.font = '26px Monospace';
          ctx.fillText('Swipe / Taste, um zu starten', SIZE / 2, SIZE / 2);
          ctx.fillText('und zu spielen', SIZE / 2, SIZE / 2 + 40);
        } else {
          ctx.font = '30px Monospace';
          ctx.fillText('Drücke die Leertaste,', SIZE / 2, SIZE / 2);
          ctx.fillText('um das Spiel zu starten', SIZE / 2, SIZE / 2 + 40);
        }
        return;
      }

      // Game Over
      if (end) {
        playGameOverSound();

        ctx.fillStyle = '#22424a';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#da8d12';
        ctx.textAlign = 'center';

        if (window.innerWidth <= 720 || window.innerHeight <= 576) {
          ctx.font = '10px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Tippe Button / Taste für Neustart', SIZE / 2, SIZE / 2 + 20);
        } else if (navigator.userAgent.match(/iPad|Macintosh/i)) {
          ctx.font = '26px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Swipe / Taste für Neustart', SIZE / 2, SIZE / 2 + 40);
        } else {
          ctx.font = '27px Monospace';
          ctx.fillText('Du hast verloren - Punkte: ' + points, SIZE / 2, SIZE / 2);
          ctx.fillText('Drücke B für Neustart', SIZE / 2, SIZE / 2 + 40);
        }
        return;
      }

      // Spiel läuft
      playStartSound();

      // Hintergrund
      ctx.fillStyle = '#22424a';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Neue Kopfposition
      const head = { x: snake[0].x, y: snake[0].y };

      // 180°-Drehung verhindern
      if (Math.abs(direction) !== Math.abs(newDirection)) {
        direction = newDirection;
      }

      const axis = Math.abs(direction) === 1 ? 'x' : 'y';
      head[axis] += (direction < 0 ? -GRID_SIZE : GRID_SIZE);

      // Essen getroffen?
      for (let i = 0; i < foods.length; i++) {
        if (foods[i].x === head.x && foods[i].y === head.y) {
          foods.splice(i, 1);
          snakeLength += 3;
          points += 5;
          break;
        }
      }

      // Schlange updaten
      snake.unshift(head);
      snake = snake.slice(0, snakeLength);

      // Rand-Kollision
      if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE) {
        end = true;
      }

      // Snake zeichnen + Selbstkollision
      const snakeObj = {};
      ctx.fillStyle = 'rgba(183, 255, 0, 0.33)';

      for (let i = 0; i < snake.length; i++) {
        const part = snake[i];
        ctx.fillRect(part.x, part.y, GRID_SIZE - 1, GRID_SIZE - 1);
        if (i > 0) snakeObj[coordToString(part)] = true;
      }

      if (snakeObj[coordToString(head)]) {
        end = true;
      }

      // Essen nachspawnen (bis 5)
      while (foods.length < 5) {
        const newFood = { x: randomFood(), y: randomFood() };
        if (!snakeObj[coordToString(newFood)] && coordToString(newFood) !== coordToString(head)) {
          foods.push(newFood);
        }
      }

      // Essen zeichnen
      ctx.fillStyle = 'red';
      for (let i = 0; i < foods.length; i++) {
        ctx.fillRect(foods[i].x, foods[i].y, GRID_SIZE, GRID_SIZE);
      }

      // Punkte
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

    // --- Keyboard (alles in EINEM Listener, sauber) ---
    window.addEventListener('keydown', function (e) {
      if (isInputFocused()) return;

      // Space: nicht scrollen
      if (e.code === 'Space') e.preventDefault();

      // Start
      if (e.code === 'Space' && !gameStarted) {
        e.preventDefault();
        handleAnyInputStartOrRestart();
        return;
      }

      // Restart mit B
      if (e.code === 'KeyB') {
        e.preventDefault();
        if (end) resetGameState();
        return;
      }

      // Pfeiltasten steuern
      const keyToAction = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const action = keyToAction[e.key];
      if (!action) return;

      e.preventDefault();

      // Optional: beim GameOver keine Richtungswechsel
      if (end) return;

      // Optional: wenn noch nicht gestartet, direkt starten (auch mit Pfeilen)
      if (handleAnyInputStartOrRestart()) return;

      handleKeyAction(action);
    });

    // --- Mobile Buttons: Pointer Events (FIX) ---
    function bindControl(btn, action) {
      if (!btn) return;

      // verhindert Scroll/Zoom und sorgt dafür, dass preventDefault funktioniert
      btn.style.touchAction = 'none';

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Start/Restart per Button
        if (handleAnyInputStartOrRestart()) return;

        // normal steuern
        handleKeyAction(action);
      }, { passive: false });
    }

    // Button-Steuerung (Pfeile in HTML)
    const upBtn = document.querySelector('.up');
    const downBtn = document.querySelector('.down');
    const leftBtn = document.querySelector('.left');
    const rightBtn = document.querySelector('.right');

    bindControl(upBtn, 'up');
    bindControl(downBtn, 'down');
    bindControl(leftBtn, 'left');
    bindControl(rightBtn, 'right');

    // Resize
    window.addEventListener('resize', adjustCanvasSize);

    // Start
    adjustCanvasSize();

    // Optional: auf Canvas Touch/Pointer verhindern, damit es nicht scrollt
    canvas.style.touchAction = 'none';

    setInterval(tick, 100);
  }

  // DOMContentLoaded ist oft zuverlässiger als load (Buttons sind dann sicher da)
  window.addEventListener('DOMContentLoaded', initGameCanvas);
})();