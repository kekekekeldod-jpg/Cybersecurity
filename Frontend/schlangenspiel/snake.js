// =============================================================
//  Mein erstes Spiel – Snake (sauber strukturiert & kommentiert)
//  Drop-in für: schlangenspiel/snake.js
//  Voraussetzung im HTML: <canvas id="field"></canvas>
//                         Buttons mit .up/.down/.left/.right
//  Audio-Dateien: ../audios/start-music.mp3, ../audios/game-over.mp3
// =============================================================
(function () {
  // ---------------------------
  // 1) KONFIGURATION / KONSTANTEN
  // ---------------------------
  const TICK_MS = 100;          // Spielgeschwindigkeit (ms pro Tick)
  const FOOD_TARGET = 5;        // Anzahl gleichzeitiger Foods
  const GROW_BY = 3;            // Längenzuwachs pro Food
  const SCORE_PER_FOOD = 5;     // Punkte pro Food
  const SMALL_SIZE = 200;       // Canvas-Kantenlänge bei kleinen Viewports (CSS px)
  const LARGE_SIZE = 600;       // Canvas-Kantenlänge bei großen Viewports (CSS px)
  const CELL_COUNT = 100;        // Anzahl Zellen pro Kante (Raster ist immer 40x40)
  // Richtungen: -2 (hoch), 2 (runter), -1 (links), 1 (rechts)
  const DIR = { UP: -2, DOWN: 2, LEFT: -1, RIGHT: 1 };

  // ---------------------------
  // 2) SPIELZUSTAND
  // ---------------------------
  const state = {
    // Canvas / Zeichenkontext
    canvas: null,
    ctx: null,

    // Responsive / Geometrie
    cssSize: LARGE_SIZE,    // CSS-Pixel-Kante (200 oder 600)
    cell: 15,               // Rastergröße in CSS-Pixeln (= cssSize / CELL_COUNT)

    // Snake
    snake: [],              // Array von Segmenten: {x,y}
    length: 5,              // Soll-Länge (wächst bei Food)
    dir: DIR.RIGHT,         // aktuelle Bewegungsrichtung
    nextDir: DIR.RIGHT,     // gepufferte Richtung (vom Input)

    // Food
    foods: [],

    // Spielfluss
    started: false,
    gameOver: false,
    score: 0,

    // Audio
    startSound: null,
    gameOverSound: null,
    gameOverPlayedOnce: false,

    // Touch
    isTouching: false,
    touchStart: { x: 0, y: 0 },
    minSwipe: 20, // Mindesabstand für Wisch-Erkennung
  };

  // ---------------------------
  // 3) HILFSFUNKTIONEN
  // ---------------------------

  // Gerät „klein“? (Phone/kleines Tablet/enger Viewport)
  function isSmallViewport() {
    return window.innerWidth <= 565;
  }

  // iPad / Desktop Safari Heuristik wie im Original (für Texte)
  function isAppleTabletOrMac() {
    return /iPad|Macintosh/i.test(navigator.userAgent);
  }

  // Position → String-Key (für schnelle Kollisionsprüfung)
  function keyOf(pos) {
    return `${pos.x},${pos.y}`;
  }

  // Zufällige Food-Koordinate (am Raster)
  function randomGridCoord() {
    const idx = Math.floor(Math.random() * CELL_COUNT); // 0..39
    return idx * state.cell; // CSS-Pixel auf Raster
  }

  // Richtung invertiert?
  function isOppositeDir(a, b) {
    return Math.abs(a) === Math.abs(b) && a !== b;
  }

  // ---------------------------
  // 4) CANVAS INITIALISIERUNG (RETINA-SCHARF)
  // ---------------------------
  function setupCanvasSize() {
    const css = isSmallViewport() ? SMALL_SIZE : LARGE_SIZE;
    state.cssSize = css;
    state.cell = css / CELL_COUNT;

    // Device Pixel Ratio berücksichtigen – scharfe Darstellung
    const dpr = window.devicePixelRatio || 1;

    // Canvas CSS-Größe
    state.canvas.style.width = css + "px";
    state.canvas.style.height = css + "px";

    // „Backstore”-Größe (tatsächliche Pixel)
    state.canvas.width = Math.floor(css * dpr);
    state.canvas.height = Math.floor(css * dpr);

    // Zeichenkontext auf dpr skalieren
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------------------------
  // 5) SPIEL ZURÜCKSETZEN / NEUSTART
  // ---------------------------
  function resetGame() {
    state.started = true;
    state.gameOver = false;
    state.score = 0;
    state.length = 5;
    state.dir = DIR.RIGHT;
    state.nextDir = DIR.RIGHT;
    state.foods = [];
    state.gameOverPlayedOnce = false;

    const center = Math.floor(CELL_COUNT / 2) * state.cell; // Mitte auf Raster
    state.snake = [{ x: center, y: center }];

    // Sounds sauber zurücksetzen
    if (state.startSound) {
      state.startSound.currentTime = 0;
      // nicht automatisch abspielen – passiert im Tick
    }
    if (state.gameOverSound) {
      state.gameOverSound.pause();
      state.gameOverSound.currentTime = 0;
    }
  }

  // ---------------------------
  // 6) ZEICHEN-SCREENS (START/GAMEOVER)
  // ---------------------------
  function drawStartScreen() {
    const { ctx, cssSize } = state;
    ctx.fillStyle = "#22424a";
    ctx.fillRect(0, 0, cssSize, cssSize);

    ctx.fillStyle = "#da8d12";
    ctx.textAlign = "center";

    if (isSmallViewport()) {
      ctx.font = "11px Monospace";
      ctx.fillText("Drücke eine beliebige Taste,", cssSize / 2, cssSize / 2);
      ctx.fillText("um das Spiel zu starten", cssSize / 2, 120);
    } else if (isAppleTabletOrMac()) {
      ctx.font = "26px Monospace";
      ctx.fillText("Swipe in eine beliebige", cssSize / 2, cssSize / 2);
      ctx.fillText("Richtung, um zu starten", cssSize / 2, 360);
    } else {
      ctx.font = "30px Monospace";
      ctx.fillText("Drücke die Leertaste,", cssSize / 2, cssSize / 2);
      ctx.fillText("um das Spiel zu starten", cssSize / 2, 360);
    }
  }

  function drawGameOver() {
    const { ctx, cssSize, score } = state;

    // Musik-Logik
    if (!state.gameOverPlayedOnce) {
      if (state.startSound) {
        state.startSound.pause();
        state.startSound.currentTime = 0;
      }
      if (state.gameOverSound) {
        state.gameOverSound.play().catch(() => {});
      }
      state.gameOverPlayedOnce = true;
    }

    ctx.fillStyle = "#22424a";
    ctx.fillRect(0, 0, cssSize, cssSize);

    ctx.fillStyle = "#da8d12";
    ctx.textAlign = "center";

    if (isSmallViewport()) {
      ctx.font = "10px Monospace";
      ctx.fillText(`Du hast verloren - Punkte: ${score}`, cssSize / 2, cssSize / 2);
      ctx.fillText("Drücke eine beliebige Taste", cssSize / 2, 120);
    } else if (isAppleTabletOrMac()) {
      ctx.font = "26px Monospace";
      ctx.fillText(`Du hast verloren - Punkte: ${score}`, cssSize / 2, cssSize / 2);
      ctx.fillText("Swipe in eine Richtung", cssSize / 2, 360);
    } else {
      ctx.font = "27px Monospace";
      ctx.fillText(`Du hast verloren - Punkte: ${score}`, cssSize / 2, cssSize / 2);
      ctx.fillText("Drücke die Leertaste", cssSize / 2, 350);
    }
  }

  // ---------------------------
  // 7) SPIELTICK (LOGIK + RENDER)
  // ---------------------------
  function tick() {
    setupCanvasSize(); // responsive neu setzen (billig genug pro Tick)

    if (!state.started) {
      drawStartScreen();
      return;
    }

    const { ctx, cssSize } = state;

    // Start-Sound abspielen (einmalig zu Beginn)
    if (!state.gameOver && state.startSound && state.startSound.paused) {
      state.startSound.play().catch(() => {});
    }

    // Hintergrund
    ctx.fillStyle = "#22424a";
    ctx.fillRect(0, 0, cssSize, cssSize);

    if (state.gameOver) {
      drawGameOver();
      return;
    }

    // Richtung übernehmen (kein Sofort-Umschlag auf Gegenteil)
    if (!isOppositeDir(state.dir, state.nextDir)) {
      state.dir = state.nextDir;
    }

    // Kopf berechnen
    const head = { x: state.snake[0].x, y: state.snake[0].y };
    const axis = Math.abs(state.dir) === 1 ? "x" : "y";
    if (state.dir < 0) head[axis] -= state.cell;
    else head[axis] += state.cell;

    // Kollision mit Rand?
    if (
      head.x < 0 ||
      head.x >= state.cssSize ||
      head.y < 0 ||
      head.y >= state.cssSize
    ) {
      state.gameOver = true;
      return;
    }

    // Food einsammeln?
    for (let i = 0; i < state.foods.length; i++) {
      const f = state.foods[i];
      if (f && f.x === head.x && f.y === head.y) {
        state.foods.splice(i, 1);
        state.length += GROW_BY;
        state.score += SCORE_PER_FOOD;
        break;
      }
    }

    // Snake Erweitern (Kopf vorn)
    state.snake.unshift(head);
    state.snake = state.snake.slice(0, state.length);

    // Selbstkollision?
    const occupied = Object.create(null);
    // ab Index 1 eintragen, damit Kopf nicht mit sich selbst verglichen wird
    for (let i = 1; i < state.snake.length; i++) {
      occupied[keyOf(state.snake[i])] = true;
    }
    if (occupied[keyOf(head)]) {
      state.gameOver = true;
      return;
    }

    // Foods nachfüllen
    while (state.foods.length < FOOD_TARGET) {
      state.foods.push({ x: randomGridCoord(), y: randomGridCoord() });
    }

    // Punkte
    ctx.fillStyle = "#d90082";
    ctx.font = isSmallViewport() ? "10px Monospace" : "20px Monospace";
    ctx.fillText(`Punkte: ${state.score}`, isSmallViewport() ? 33 : 80, isSmallViewport() ? 14 : 30);

    // Snake zeichnen
    ctx.fillStyle = "rgba(183, 255, 0, 0.329)";
    for (const seg of state.snake) {
      ctx.fillRect(seg.x, seg.y, state.cell - 1, state.cell - 1);
    }

    // Food zeichnen
    ctx.fillStyle = "red";
    for (const f of state.foods) {
      ctx.fillRect(f.x, f.y, state.cell, state.cell);
    }
  }

  // ---------------------------
  // 8) INPUT (Tastatur / Buttons / Touch)
  // ---------------------------
  function startOrResetIfNeeded() {
    if (!state.started || state.gameOver) {
      resetGame();
    }
  }

  function setDirection(dir) {
    // Kein Direktwechsel auf die Gegenrichtung
    if (isOppositeDir(state.dir, dir)) return;
    state.nextDir = dir;
  }

  function handleKeydown(e) {
    // Eingaben in Formularfeldern ignorieren
    const ae = document.activeElement;
    const isForm =
      ae &&
      ((ae.tagName === "INPUT" &&
        /^(text|password|email|tel|search|number)$/i.test(ae.type)) ||
        ae.tagName === "TEXTAREA");
    if (isForm) return;

    const code = e.keyCode || e.which;
    if (code === 32) {
      // Space: Start/Restart
      e.preventDefault();
      startOrResetIfNeeded();
      return;
    }
    const map = { 37: DIR.LEFT, 38: DIR.UP, 39: DIR.RIGHT, 40: DIR.DOWN };
    if (map[code]) {
      e.preventDefault();
      startOrResetIfNeeded();
      setDirection(map[code]);
    }
  }

  function bindButtons() {
    const q = (sel) => document.querySelector(sel);
    const map = [
      [".up", DIR.UP],
      [".down", DIR.DOWN],
      [".left", DIR.LEFT],
      [".right", DIR.RIGHT],
    ];
    for (const [sel, dir] of map) {
      const el = q(sel);
      if (!el) continue;
      el.addEventListener("click", () => {
        startOrResetIfNeeded();
        setDirection(dir);
      });
    }
  }

  function bindTouch() {
    const c = state.canvas;

    c.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;
      state.isTouching = true;
      state.touchStart.x = e.touches[0].clientX;
      state.touchStart.y = e.touches[0].clientY;
    });

    c.addEventListener("touchmove", (e) => {
      if (!state.isTouching || !e.touches || !e.touches[0]) return;
      const dx = e.touches[0].clientX - state.touchStart.x;
      const dy = e.touches[0].clientY - state.touchStart.y;

      // horizontale/vertikale Dominanz
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > state.minSwipe) {
          startOrResetIfNeeded();
          setDirection(DIR.RIGHT);
          state.isTouching = false;
        } else if (dx < -state.minSwipe) {
          startOrResetIfNeeded();
          setDirection(DIR.LEFT);
          state.isTouching = false;
        }
      } else {
        if (dy > state.minSwipe) {
          startOrResetIfNeeded();
          setDirection(DIR.DOWN);
          state.isTouching = false;
        } else if (dy < -state.minSwipe) {
          startOrResetIfNeeded();
          setDirection(DIR.UP);
          state.isTouching = false;
        }
      }
    });

    c.addEventListener("touchend", () => {
      state.isTouching = false;
    });
  }

  // ---------------------------
  // 9) INIT
  // ---------------------------
  function init() {
    state.canvas = document.getElementById("field");
    if (!state.canvas) {
      console.error("Canvas #field nicht gefunden.");
      return;
    }
    state.ctx = state.canvas.getContext("2d");

    // Sounds vorbereiten
    state.startSound = new Audio("../audios/start-music.mp3");
    state.gameOverSound = new Audio("../audios/game-over.mp3");

    // Größe setzen
    setupCanvasSize();

    // Erste Anzeige: Startscreen
    drawStartScreen();

    // Input binden
    window.addEventListener("keydown", handleKeydown);
    bindButtons();
    bindTouch();

    // Resize (leicht gedrosselt)
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setupCanvasSize(), 100);
    });

    // Spiel-Loop starten
    setInterval(tick, TICK_MS);
  }

  // Autostart nach Seiten-Load
  window.addEventListener("load", init);
})();
