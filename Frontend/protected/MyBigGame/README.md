# 🎮 Merdo of Caney  
Ein JavaScript-Canvas-Spiel, entwickelt von **Merdo (Mertcan)**

## 📌 Beschreibung

**Merdo of Caney** ist ein 2D-JavaScript-Spiel, das vollständig mit dem HTML5-Canvas entwickelt wurde und sich aktuell in aktiver Entwicklung befindet.  
Das Projekt kombiniert Kreativität, selbst entworfene Grafiken sowie grundlegende Spielmechaniken wie Bewegung, Sprungphysik, Gegnerinteraktion und Animationen.

Alle Charaktere, Sprites und Sprite-Sheets wurden eigenständig von mir (**Mertcan**) mit der Software **Krita** gezeichnet.

Das Spiel enthält humorvolle Elemente und stilisierte Pseudonamen, um dem gesamten Projekt eine persönliche und kreative Note zu verleihen.

---

## 🖥️ Spielbildschirme

### ⭐ Startbildschirm
- Zeigt den Titel **„مَرْدُوٓ هَكَرٰ ﷻ“**, was „Merdo Hacker“ auf Arabisch bedeutet  
- Hintergrundbild: **Anonymous-Wallpaper**, passend zum apokalyptischen Spielthema  
- Untertitel **„Merdo of Caney“** als stilisierter, humorvoller Projektname  
- Aufforderungen:
  - **Press ENTER to start** – startet das Spiel  
  - **Press Q** – zurück zum Startbildschirm  
  - **Press I** – zeigt die Spielregeln an  

### ⭐ Game-Over-Bildschirm
- Zeigt zentral den Schriftzug **„﷽“**, was „Im Namen Gottes, des Allerbarmers, des Barmherzigen“ bedeutet  
- Hintergrund: spezielles Game-Over-Wallpaper  
- Der Bildschirm erscheint bei:
  - seitlicher Kollision mit dem Canvas  
  - fehlerhafter Gegnerkollision  
- Mit **ENTER** wird das Spiel neu gestartet  

---

## 🕹️ Features

### ✔ Steuerung
- **← / →** laufen  
- **↑** springen  
- **ENTER** Spiel starten oder nach Game Over neu starten  
- **Q** jederzeit zurück zum Startbildschirm  
- **I** Spielregeln anzeigen  

### ✔ Charaktere
- **Merdonis** – Hauptspieler mit Lauf- und Sprunganimation  
- **JuliePie** – Enemy mit Death-Animation und automatischem Respawn  
- **Caney-Flieger** – dekorativer Flieger; eine Berührung mit dem Kopf von Merdonis führt zu Game Over  

### ✔ Musik & Soundeffekte
- Hintergrundmusik  
- Lauf-Sound  
- Sprung-Sound  
- Landegeräusch  
- Enemy-Hit / Enemy-Death  
- Game-Over-Musik  

Alle Sounds werden korrekt zurückgesetzt (`currentTime = 0`), sodass sie beim erneuten Abspielen nicht an der vorherigen Stelle fortgesetzt werden.

---

## 🎮 Spielmechaniken
- Physikbasiertes Springen (Schwerkraft, Aufprall)  
- Der Gegner **JuliePie** kann nur durch einen korrekten Kopftreffer besiegt werden  
- **+5 Punkte** für jeden erfolgreichen Sprung auf JuliePie  
- **+10 Punkte** für einen Doppelt-Treffer  
- Seitliche Kollisionen führen zu **Game Over**  
- Die **sechste Bodenberührung** führt ebenfalls zu **Game Over**  
- Pro Bodenkontakt wird **ein Herz** verloren (insgesamt 6 Leben)  
- Berührt der Kopf von **Merdonis** den unteren Bereich des **Caney-Fliegers**, führt dies ebenfalls zu **Game Over**  
- AABB-Collision-Detection mit erweiterter Y-Achsen-Logik  
- State-Machines für Player und Enemies  
- Automatischer Respawn von JuliePie  
- Caney-Flieger aktuell ohne weitere Spiellogik  

---

## 👤 Autor
**Merdo (Mertcan)**  
Programmierer, Designer und Illustrator  

Alle Grafiken und Animationen wurden vollständig selbst erstellt.
