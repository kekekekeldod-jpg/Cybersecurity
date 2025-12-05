# 🎮 Merdo of Caney 
Ein JavaScript Canvas Game, entwickelt von **Merdo (Mertcan)**

## 📌 Beschreibung

**Merdo of Caney** ist ein 2D-JavaScript-Spiel, vollständig im HTML5-Canvas programmiert und befindet sich derzeit in aktiver Entwicklung.  
Das Projekt kombiniert Kreativität, selbst entworfene Grafiken und grundlegende Spielmechaniken wie Bewegung, Sprungphysik, Gegnerinteraktion und Animationen.

Alle Charaktere, Sprites und Sprite-Sheets wurden eigenständig von mir **Mertcan** mit der Software **Krita** gezeichnet.

Das Spiel enthält außerdem humorvolle Elemente und stilisierte Pseudonamen, um dem Gesamtprojekt eine persönliche und kreative Note zu verleihen.

---

## 🖥️ Spielbildschirme

### **⭐ Startbildschirm**
- Zeigt den Titel **„Crack iPhone“**.
- Hintergrundbild: **Anonymous-Wallpaper**, passend zum apokalyptischen Spielthema.
- Untertitel **„Merdo of Caney“** dient als stilisierter, humorvoller Projektname.
- Aufforderung:  
  **„Press ENTER to start“**
- ENTER beginnt das Spiel.

### **⭐ Game-Over Bildschirm**
- Zeigt groß den Schriftzug **„Cracked Inject“**.
- Hintergrund: spezielles **Game-Over Wallpaper**.
- Der Screen erscheint bei:
  - Kollision seitlich mit dem Canvas
  - unkorrekter Enemy-Kollision
- ENTER startet das Spiel neu.

---

## 🕹️ Features

### ✔ Steuerung
- **← / →** Laufen  
- **↑** Springen  
- **ENTER** Spiel starten oder nach Game Over erneut starten  
- **Q** jederzeit zurück zum Startscreen  

### ✔ Charaktere
- **Hauptspieler** mit Lauf- und Sprunganimation  
- **Enemy** mit Death-Animation und Respawn  
- **Deko-Flieger** – fliegt dekorativ im oberen Bereich  

### ✔ Musik & Soundeffekte
- Background Music  
- Running Sound  
- Jump Sound  
- Feet Landing Sound  
- Enemy Hit / Death Sound  
- Game Over Musik  

Alle Sounds werden korrekt zurückgesetzt (`currentTime = 0`), damit sie beim erneuten Abspielen nicht an der vorherigen Stelle fortgesetzt werden.

---

## 🎮 Spielmechaniken
- Physik-basiertes Springen (Schwerkraft, Aufprall)
- Gegner kann **nur durch korrekten Kopftreffer** besiegt werden
- Seitenkollision führt zu **Game Over**
- AABB Collision Detection + erweiterte Y-Achsen-Logik
- State Machines für Player & Enemy
- Automatischer Enemy-Respawn
- Deko-Flieger keine logischen Eigenschaften (zur Zeit)

---

## 👤 Autor
**Merdo (Mertcan)**  
Programmierer, Designer und Illustrator  
Alle Grafiken und Animationen wurden vollständig selbst erstellt.

