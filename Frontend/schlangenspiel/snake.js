// Mein erstes Spiel

(function() {  
  function initGameCanvas() {

    
  // Größe des Spielfelds
  var SIZE = 0; 
  // Größe eines Rasters im Spielfeld
  var GRID_SIZE = SIZE / 80;
  // Referenz zum Canvas-Element
  var field = document.getElementById('field');
  // Flag, ob das Canvas bereits initialisiert wurde
  var canvasInitialized = false; 
  // Setze die Höhe und Breite des Canvas-Elements
  field.height = field.width = SIZE * 2;
  // Setze die Breite und Höhe des Canvas-Elements als CSS-Eigenschaft
  field.style.width = field.style.height = SIZE + 'px';
  // Kontext des Canvas-Elements
  var ctx = field.getContext('2d');
  // Skalierung des Canvas-Kontextes
  ctx.scale(2, 2);
  // Audio-Element für den Start-Sound
  var startSound = new Audio('../audios/start-music.mp3'); 
  // Audio-Element für den Game-Over-Sound
  var gameOverSound = new Audio('../audios/game-over.mp3');
  // Richtung der Schlange (-2: hoch, 2: runter, -1: links, 1: rechts)
  var direction = newDirection = 1; 
  // Länge der Schlange
  var snakeLength = 5;
  // Array zur Speicherung der Koordinaten der Schlange
  var snake = [{ x: SIZE / 2, y: SIZE / 2 }]; 
  // Array zur Speicherung der Koordinaten der Lebensmittel
  var foods = [];
  // Flag für das Spielende
  var end = false;
  // Punktzahl des Spielers
  var Punkte = 0;
  // Flag, ob das Spiel gestartet wurde
  var gameStarted = false;
  // Flag, ob der Game-Over-Sound abgespielt wurde
  var gameOverMusicPlayed = false;
  // Startposition des Touch
  var touchStartPos = 20;
  // Mindesabstand zum Auslösen einer Bewegung
  var minTouchMoveDist = 20;

  // Funktion zum Überprüfen, ob ein Eingabefeld aktiv ist
function isInputFocused() {
    var activeElement = document.activeElement;
    return (activeElement.tagName === 'INPUT' && (activeElement.type === 'text' || activeElement.type === 'password' || activeElement.type === 'email' || activeElement.type === 'tel')) || 
           (activeElement.tagName === 'TEXTAREA');
}

  // Funktion zur Generierung einer zufälligen Position für Lebensmittel
  function randomFood() {
    return Math.floor(Math.random() * SIZE / GRID_SIZE) * GRID_SIZE;
  }

  // Funktion zum Umwandeln einer Koordinaten-Objekts in einen String
  function coordToString(obj) {
    return [obj.x, obj.y].join(',');
  }

  // Funktion zum Abspielen des Start-Sounds
  function playStartSound() {
    if (!gameOverMusicPlayed){
      startSound.play();
    }
  }
 
  // Funktion zum Abspielen des Game-Over-Sounds
  function playGameOverSound() {
    startSound.pause();
    startSound.currentTime = 0;
    if (!gameOverMusicPlayed) {
      gameOverSound.play();
      gameOverMusicPlayed = true;
    }
  }

    // Funktion zur Anpassung der Größe des Canvas-Elements
    function adjustCanvasSize() {
      if (!canvasInitialized) {
        // Setze canvasInitialized auf true
        canvasInitialized = true;
        // Bestimme die neue Größe abhängig von der Bildschirmbreite
        if (window.innerWidth <= 720 || window.innerHeight <= 576) {
          SIZE = 200;
        } else {
          SIZE = 600;
        }
        // Setze die neue Größe des Canvas-Elements und skaliere den Kontext
        field.width = field.height = SIZE * 2;
        field.style.width = field.style.height = SIZE + 'px';
        ctx.scale(2, 2);
        GRID_SIZE = SIZE / 40;
        return;
      }
    }
    
    window.addEventListener('resize', function() {
      // Setze canvasInitialized zurück, um die  Größe beim nächsten Aufruf von adjustCanvasSize() erneut zu bestimmen
      canvasInitialized = false;
  adjustCanvasSize();
});

  // Hauptspiel-Loop
  function tick() {
    adjustCanvasSize();
    if (!gameStarted) {
  // Anzeige des Startbildschirms
  if (window.innerWidth <= 720 || window.innerHeight <= 576) {
    ctx.fillStyle = '#22424a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#da8d12';
    ctx.font = '11px Monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Drücke eine beliebige Taste,', SIZE / 2, SIZE / 2);
    ctx.fillText('um das Spiel zu starten', SIZE / 2, 120);
  } else if (navigator.userAgent.match(/iPad|Macintosh/i)) {
    ctx.fillStyle = '#22424a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#da8d12';
    ctx.font = '26px Monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Swipe in eine beliebige', SIZE / 2, SIZE / 2);
    ctx.fillText('Richtung, um das Spiel zu starten ', SIZE / 2, 360);
  } else {
    ctx.fillStyle = '#22424a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#da8d12';
    ctx.font = '30px Monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Drücke die Leertaste,', SIZE / 2, SIZE / 2);
    ctx.fillText('um das Spiel zu starten ', SIZE / 2, 360);
  }
  return;
}

playStartSound(); // Hier wird playStartSound() aufgerufen, um den Startsound abzuspielen

    // Erstelle ein neues snakePart-Objekt mit den gleichen Koordinaten wie der Kopf der Schlange
var snakePart = { x: snake[0].x, y: snake[0].y };

// Aktualisiere die Richtung der Schlange, wenn sie sich nicht in die entgegengesetzte Richtung bewegt
if (Math.abs(direction) !== Math.abs(newDirection)) {
  direction = newDirection;
}

// Bestimme die Bewegungsachse basierend auf der Richtung
var axis = Math.abs(direction) === 1 ? 'x' : 'y';

// Aktualisiere die Koordinate des snakePart basierend auf der Bewegungsrichtung
if (direction < 0) {
  snakePart[axis] -= GRID_SIZE; // Bewege nach links oder oben
} else {
  snakePart[axis] += GRID_SIZE; // Bewege nach rechts oder unten
}

// Iteriere durch das Array der Lebensmittel
for (var i = 0; i < foods.length; i++) {
  // Überprüfe, ob der snakePart ein Lebensmittel erreicht hat
  if (foods[i] && foods[i].x === snakePart.x && foods[i].y === snakePart.y) {
    // Entferne das verbrauchte Lebensmittel aus dem Array
    foods.splice(i, 1);
    // Erhöhe die Länge der Schlange und aktualisiere den Punktestand
    snakeLength += 3;
    Punkte += 5;
  }
}

    ctx.fillStyle = '#22424a';
    ctx.fillRect(0, 0, SIZE, SIZE); 
    
    if (end) {
      playGameOverSound();
    if (window.innerWidth <= 720 || window.innerHeight <= 576) {
        ctx.fillStyle = '#da8d12';
        ctx.font = '10px Monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Du hast verloren - Punkte: ' + Punkte, SIZE / 2, SIZE / 2);
        ctx.fillText('Drücke eine beliebige Taste', SIZE / 2, 120);
        return;
    } else if (navigator.userAgent.match(/iPad|Macintosh/i))  {
        ctx.fillStyle = '#22424a';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = '#da8d12';
        ctx.font = '26px Monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Du hast verloren - Punkte: ' + Punkte, SIZE / 2, SIZE / 2);
        ctx.fillText('Swipe in eine Richtung', SIZE / 2, 360);
        return;
    } else {
      ctx.fillStyle = '#da8d12';
        ctx.font = '27px Monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Du hast verloren - Punkte: ' + Punkte, SIZE / 2, SIZE / 2);
        ctx.fillText('Drücke die Leertaste', SIZE / 2, 350);
        return;
    }
}
  // Ansonsten: Schlange bewegen und Punkte anzeigen
  if (window.innerWidth <= 720) {
      snake.unshift(snakePart);
      snake = snake.slice(0, snakeLength);
      ctx.fillStyle = '#d90082';
      ctx.font = '10px Monospace';
      ctx.fillText('Punkte:' + Punkte, 33, 14);
  } else {
    snake.unshift(snakePart);
    snake = snake.slice(0, snakeLength);
    ctx.fillStyle = '#d90082';
    ctx.font = '20px Monospace';
    ctx.fillText('Punkte:' + Punkte, 80, 30);
}

    // Überprüfe, ob die Schlange die Grenzen des Spielfelds erreicht hat
if (snakePart.x < 0 || snakePart.x >= SIZE || snakePart.y < 0 || snakePart.y >= SIZE) {
  end = true // Setze das Spielende, wenn die Schlange die Grenzen überschreitet
}
    
    // Hier wird die Farbe für die Schlange und ihre Rasterzellen festgelegt
ctx.fillStyle = 'rgba(183, 255, 0, 0.329)';
// Hier wird ein leeres Objekt erstellt, um die Positionen der Schlangenteile zu speichern
var snakeObj = {};
// Schleife, die jedes Schlangenteil zeichnet und dessen Position im Objekt snakeObj speichert
for (var i = 0; i < snake.length; i++) {
  var a = snake[i];
  // Zeichnet jedes Schlangenteil auf dem Spielfeld
  ctx.fillRect(a.x, a.y, GRID_SIZE - 1, GRID_SIZE - 1); 
  // Überprüft, ob es sich nicht um den Kopf der Schlange handelt, und speichert seine Position im snakeObj
  if (i > 0) snakeObj[coordToString(a)] = true;
}

// Überprüft, ob die Schlange mit sich selbst kollidiert, indem überprüft wird, ob die aktuelle Position des Schlangenkopfs bereits im snakeObj vorhanden ist
if (snakeObj[coordToString(snakePart)]) end = true; 

// Schleife, die Lebensmittel auf dem Spielfeld zeichnet
while (foods.length < 5) {
  var newFood = { x: randomFood(), y: randomFood() };
  foods.push(newFood);
}
    // Hier wird die Farbe für die Lebensmittel festgelegt
ctx.fillStyle = 'red';
// Schleife, die jedes Lebensmittel zeichnet
for (var i = 0; i < foods.length; i++) {
  ctx.fillRect(foods[i].x, foods[i].y, GRID_SIZE, GRID_SIZE); 
}

}

  // Funktion zur Initialisierung des Spiels beim Laden der Seite
    setInterval(tick, 100); 
    window.addEventListener('resize', adjustCanvasSize);

    // Funktion zur Behandlung von Tastatureingaben
    function handleKeyAction(action) {
      if (!gameStarted || end) {
        // Starte oder starte das Spiel neu bei Drücken der Leertaste
        gameStarted = true;
        end = false;
        Punkte = 0;

        // Setze die Schlange zurück
        snakeLength = 5;
        snake = [{ x: SIZE / 2, y: SIZE / 2 }];

        direction = newDirection = 1;
        foods = [];
        gameOverMusicPlayed = false;
      }

      // Aktualisiere die Richtung basierend auf der Aktion
      switch (action) {
        case 'up':
          newDirection = -2;
          break;
        case 'down':
          newDirection = 2;
          break;
        case 'left':
          newDirection = -1;
          break;
        case 'right':
          newDirection = 1;
          break;
      }
    }

    // Event-Listener für Tastatureingaben
    window.onkeydown = function(e) {
      if (!isInputFocused()) {
        if (e.keyCode === 32) {
          e.preventDefault();
          handleKeyAction('space');
        } else {
          e.preventDefault();
          newDirection = { 37: -1, 38: -2, 39: 1, 40: 2 } [e.keyCode] || newDirection;
        }
      }
    };  

    // Überprüfung, ob es sich um ein iPad handelt
if (navigator.userAgent.match(/iPad|Macintosh/i)){
  // Event-Listener für Tastatureingaben und Touch-Gesten
  window.onkeydown = function(e) {
    if (!isInputFocused()) {
      if (e.keyCode === 32) {
        e.preventDefault();
        handleKeyAction('space');
      } else {
        e.preventDefault();
        newDirection = { 37: -1, 38: -2, 39: 1, 40: 2 } [e.keyCode] || newDirection;
      }
    }
  };

  // Touchstart Eventlistener
window.addEventListener('touchstart', function(e) {
    // Zugriff auf das Spielfeld-Canvas
    var gameCanvas = document.getElementById('field');
    
    // Überprüfen, ob das Spielfeld-Canvas existiert und der Touch innerhalb liegt
    if (!isInputFocused() && gameCanvas && gameCanvas.contains(e.target)) {
        // Festlegen des Touch-Startpunkts
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        // Setzen von isTouching auf true
        isTouching = true;
    }
});


// Touchmove Eventlistener
window.addEventListener('touchmove', function(e) {
    // Zugriff auf das Spielfeld-Canvas
    var gameCanvas = document.getElementById('field');
    
    // Überprüfen, ob isTouching true ist und das Spielfeld-Canvas existiert
    if (isTouching && gameCanvas && gameCanvas.contains(e.target)) {
        // Berechnen des Touch-Endpunkts
        var touchEndPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        // Berechnen der Unterschiede zwischen Start- und Endpunkten
        var dx = touchEndPos.x - touchStartPos.x;
        var dy = touchEndPos.y - touchStartPos.y;

        // Bestimmen, ob die horizontale oder vertikale Bewegung größer ist
        if (Math.abs(dx) > Math.abs(dy)) { // Horizontale Bewegung
            // Prüfen, ob der Bewegungsbetrag größer ist als minTouchMoveDist
            if (dx > minTouchMoveDist) {
                handleKeyAction('right'); // Bewegung nach rechts
            } else if (dx < -minTouchMoveDist) {
                handleKeyAction('left'); // Bewegung nach links
            }
        } else { // Vertikale Bewegung
            // Prüfen, ob der Bewegungsbetrag größer ist als minTouchMoveDist
            if (dy > minTouchMoveDist) {
                handleKeyAction('down'); // Bewegung nach unten
            } else if (dy < -minTouchMoveDist) {
                handleKeyAction('up'); // Bewegung nach oben
            }
        }
    }
});


// Touchend Eventlistener
window.addEventListener('touchend', function(e) {
    // Überprüfen, ob isTouching true ist
    if (isTouching) {
        // Standard-Event-Verhalten verhindern
        e.preventDefault();
        // Setzen von isTouching auf false
        isTouching = false;
        
        // Überprüfen, ob der Touch-Endpunkt im Canvas liegt und das Spiel beendet ist
        if (!isInputFocused() && end && gameCanvas && gameCanvas.contains(e.target)) {
            // Setzen von end auf false und gameStarted auf true
            end = false;
            gameStarted = true;
            
            // Initialisieren der Schlange in der Mitte des Spielfelds
            snake = [{ x: SIZE / 2, y: SIZE / 2 }];
            // Setzen der Startposition für Lebensmittel in der Mitte des Spielfelds
            foods = [{ x: SIZE / 2, y: SIZE / 2 }];
        }
    }
});

}

    // Event-Listener für Klicks auf die Pfeiltasten
    document.querySelector('.up').onclick = function() {
      handleKeyAction('up');
    };

    document.querySelector('.left').onclick = function() {
      handleKeyAction('left');
    };

    document.querySelector('.down').onclick = function() {
      handleKeyAction('down');
    };

    document.querySelector('.right').onclick = function() {
      handleKeyAction('right');
    };
}
  window.addEventListener('load', initGameCanvas);
})();