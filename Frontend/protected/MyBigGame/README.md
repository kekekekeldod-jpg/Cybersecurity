# 🎮 Merdo of Caney  
Ein JavaScript-Canvas-Spiel, entwickelt von **Merdo (Mertcan)**

---

## 📌 Beschreibung

**Merdo of Caney** ist ein 2D-JavaScript-Spiel, das vollständig mit dem HTML5-Canvas entwickelt wurde und sich aktuell in aktiver Entwicklung befindet.  
Das Projekt kombiniert Kreativität, selbst entworfene Grafiken sowie grundlegende Spielmechaniken wie Bewegung, Sprungphysik, Gegnerinteraktion und Animationen.

Alle Charaktere, Sprites und Sprite-Sheets wurden eigenständig von mir (**Mertcan**) mit der Software **Krita** gezeichnet.

Das Spiel enthält humorvolle Elemente und stilisierte Pseudonamen, um dem gesamten Projekt eine persönliche und kreative Note zu verleihen.

---

## 🖥️ Spielbildschirme

### ⭐ Startbildschirm
- Zeigt den Titel **„مَرْدُوٓ هَكَرٰ“**, was „Merdo Hacker“ auf Arabisch bedeutet  
- Hintergrundbild: **Anonymous-Wallpaper**, passend zum apokalyptischen Spielthema  
- Untertitel **„Merdo of Caney“** als stilisierter, humorvoller Projektname  
- Aufforderungen:
  - **Press ENTER to start** – startet das Spiel  
  - **Press Q** – zurück zum Startbildschirm  
  - **Press I** – zeigt die Spielregeln an  

---

### ⭐ Game-Over-Bildschirm
- Zeigt zentral den **ASCII-/Dot-Art Schriftzug**  
- Hintergrund: spezielles Game-Over-Wallpaper  
- Der Bildschirm erscheint, wenn:
- alle Herzen (Leben) verbraucht sind  
- Mit **ENTER** wird das Spiel neu gestartet  

---

## 🕹️ Features

### ✔ Steuerung
- **← / →** laufen  
- **↑** springen  
- **ENTER** Spiel starten oder nach Game Over neu starten  
- **Q** jederzeit zurück zum Startbildschirm  
- **I** Spielregeln anzeigen  

---

### ✔ Charaktere
- **Merdonis** – Hauptspieler mit Lauf- und Sprunganimation  
- **JuliePie** – Enemy mit Death-Animation und automatischem Respawn  
- **EnemyTwo** – zweiter Enemy von der anderen Seite  
- **Caney-Flieger** – bewegliches Objekt im oberen Bereich  

---

### ✔ Musik & Soundeffekte
- Hintergrundmusik  
- Lauf-Sound  
- Sprung-Sound  
- Landegeräusch  
- Enemy-Hit / Enemy-Death  
- **Double-Kill-Sound**  
- Game-Over-Musik  

Alle Sounds werden korrekt zurückgesetzt (`currentTime = 0`), sodass sie beim erneuten Abspielen nicht an der vorherigen Stelle fortgesetzt werden.

---

## ❤️ Lebenssystem (NEU)

- Der Spieler besitzt **5 Herzen (Leben)**  
- Schaden wird nur ausgelöst durch:
  - **JuliePie (Enemy)**  
  - **EnemyTwo**  
  - **Caney-Flieger**  

---

### 🛡️ Schaden & Immunität

- Nach einem Treffer:
  - verliert der Spieler **1 Herz**
  - wird für **3 Sekunden unverwundbar**
  - blinkt visuell (Hit-Feedback)

👉 Dadurch wird verhindert, dass mehrere Treffer direkt hintereinander ausgelöst werden (**Bug-Fix gegen Instant Game Over**)

---

### ⚔️ Double-Hit Mechanik (NEU)

Wenn gleichzeitig gilt: `playerHitFromSide && playerHitFromTop`

Dann:
- kein Schaden
- kein Herzverlust
- Double-Kill-Sound wird abgespielt

Beide Gegner gelten als getroffen, ohne den Spieler zu bestrafen.

## 🎮 Spielmechaniken

- Physikbasiertes Springen (Schwerkraft, Aufprall)  
- Der Gegner **JuliePie** kann durch einen Kopftreffer besiegt werden  
- **+5 Punkte** für jeden erfolgreichen Treffer  
- **+10 Punkte** für einen Double-Hit  
- Kollisionen verursachen Schaden statt sofort Game Over  
- **5 Treffer = Game Over**  
- AABB-Collision-Detection mit erweiterter Y-Achsen-Logik  
- State-Machines für Player und Enemies  
- Automatischer Respawn der Gegner  

---

## 🖼️ Rendering & Technik

- HTML5 Canvas Rendering  
- Sprite-Animationen (Frame-based)  
- Delta-Time Movement (`dt`)  
- ASCII / Dot-Art Rendering im Game-Over-Screen  
- Darstellung über `monospace` Font  
- Zeilenweises Zeichnen im Canvas  

---

## 🏁 Ziel- & Punktesystem

- Das Spiel besitzt ein festes **Punkteziel von 300 Punkten**  
- Jeder Punktgewinn erhöht den Fortschritt Richtung Ziel  
- Ein **Prozentbalken (Progress-Bar)** zeigt jederzeit den aktuellen Fortschritt an  
- Der Fortschritt wird prozentual berechnet (0–100 %)  
- Die Anzeige ist geglättet (smooth animation)  
- Sobald **300 Punkte erreicht sind**, gilt das Spiel als **gewonnen**  
- Der Gewinnzustand löst einen eigenen Win-Screen aus  
- Nach Erreichen des Ziels werden keine weiteren Punkte mehr gezählt  