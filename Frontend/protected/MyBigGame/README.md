# 🎮 Merdo of Caney  
Ein JavaScript-Canvas-Game, entwickelt von **Merdo (Mertcan)**

## 📌 Beschreibung

**Merdo of Caney** ist ein 2D-JavaScript-Spiel, das vollständig mit HTML5-Canvas entwickelt wurde und sich aktuell in aktiver Entwicklung befindet.Das Projekt kombiniert Kreativität, selbst entworfene Grafiken und grundlegende Spielmechaniken wie Bewegung, Sprungphysik, Gegnerinteraktion und Animationen.

Alle Charaktere, Sprites und Sprite-Sheets wurden eigenständig von mir **(Mertcan)** mit der Software **Krita** gezeichnet.

Das Spiel enthält humorvolle Elemente und stilisierte Pseudonamen, um dem gesamten Projekt eine persönliche und kreative Note zu verleihen.

---

## 🖥️ Spielbildschirme

### ⭐ Startbildschirm
- Zeigt den Titel **„مَرْدُوٓ هَكَرٰ ﷻ“**, was „Merdo Hacker“ auf Arabisch bedeutet.
- Hintergrundbild: **Anonymous-Wallpaper**, passend zum apokalyptischen Spielthema
- Untertitel **„Merdo of Caney“** als stilisierter, humorvoller Projektname
- Aufforderung:
  - **Press ENTER to start** – startet das Spiel  
  - **Press Q** – zurück zum Startbildschirm  
  - **Press I** – zeigt die Spielregeln an

### ⭐ Game-Over-Bildschirm
- Zeigt groß den Schriftzug **„﷽“**, was „Im Namen Gottes, des Allerbarmers, des Barmherzigen“ bedeutet
- Hintergrund: spezielles Game-Over-Wallpaper
- Der Bildschirm erscheint bei:
  - seitlicher Kollision mit dem Canvas
  - nicht korrekter Gegnerkollision
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
- **Hauptspieler** mit Lauf- und Sprunganimation  
- **Enemy** mit Death-Animation und Respawn  
- **Deko-Flieger** (derzeit nur dekorativ)

### ✔ Musik & Soundeffekte
- Hintergrundmusik  
- Lauf-Sound  
- Sprung-Sound  
- Landegeräusch  
- Enemy-Hit / Enemy-Death  
- Game-Over-Musik  

Alle Sounds werden korrekt zurückgesetzt (`currentTime = 0`), damit sie beim erneuten Abspielen nicht an der vorherigen Stelle fortgesetzt werden.

---

## 🎮 Spielmechaniken
- physikbasiertes Springen (Schwerkraft, Aufprall)
- Gegner kann **nur durch einen korrekten Kopftreffer** besiegt werden
- Seitenkollision führt zu **Game Over**
- AABB-Collision-Detection mit erweiterter Y-Achsen-Logik
- State-Machines für Player und Enemy
- automatischer Enemy-Respawn
- dekorativer Flieger ohne logische Eigenschaften (derzeit)

---

## 👤 Autor
**Merdo (Mertcan)**  
Programmierer, Designer und Illustrator  

Alle Grafiken und Animationen wurden vollständig selbst erstellt.
