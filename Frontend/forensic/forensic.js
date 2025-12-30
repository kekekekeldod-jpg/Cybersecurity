(function () {
  function HackBruteforce() {
    const canvas = document.getElementById('canvas');
    const canvasBtn = document.getElementById('canvasBtn');
    const ctx = canvas.getContext('2d');

    const cellPhoneImage = document.getElementById('hackDog');
    const hackPhoneImage = document.getElementById('hackPhone');

    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('toggleBtn');
    const copyBtn = document.getElementById('copyBtn');

    canvas.width = 500;
    canvas.height = 500;
    const width = canvas.width;
    const height = canvas.height;

    let showHackScreen = false;
    let analysis = null;

    // ========= Passwort-Check =========
    function analyzePassword(pw) {
      const result = { score: 0, label: "Sehr schwach", tips: [] };

      if (!pw) {
        result.tips.push("Passwort ist leer.");
        return result;
      }

      const len = pw.length;
      const hasLower = /[a-z]/.test(pw);
      const hasUpper = /[A-Z]/.test(pw);
      const hasDigit = /\d/.test(pw);
      const hasSymbol = /[^A-Za-z0-9]/.test(pw);

      let score = 0;
      if (len >= 8) score += 15;
      if (len >= 10) score += 10;
      if (len >= 12) score += 15;
      if (len >= 16) score += 20;

      const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
      score += varietyCount * 7.5;

      // 3 gleiche Zeichen hintereinander
      if (/(.)\1\1/.test(pw)) {
        score -= 15;
        result.tips.push("Zu viele Wiederholungen.");
      }

      // Sequenzen (abcd, 1234)
      if (hasSequentialRun(pw)) {
        score -= 15;
        result.tips.push("Einfache Sequenzen (abcd/1234).");
      }

      // häufige Wörter
      if (/password|passwort|qwerty|admin|login/i.test(pw)) {
        score -= 30;
        result.tips.push("Sehr häufiges Muster/Wort.");
      }

      // Bonus Passphrase
      if (len >= 20 && /\s/.test(pw)) score += 10;

      score = Math.max(0, Math.min(100, Math.round(score)));
      result.score = score;

      if (score < 25) result.label = "Sehr schwach";
      else if (score < 50) result.label = "Schwach";
      else if (score < 70) result.label = "Mittel";
      else if (score < 85) result.label = "Stark";
      else result.label = "Sehr stark";

      if (len < 12) result.tips.push("Nutze 12–16+ Zeichen.");
      if (!hasLower) result.tips.push("Kleinbuchstaben hinzufügen.");
      if (!hasUpper) result.tips.push("Großbuchstaben hinzufügen.");
      if (!hasDigit) result.tips.push("Zahlen hinzufügen.");
      if (!hasSymbol) result.tips.push("Sonderzeichen oder Passphrase nutzen.");

      // Canvas-freundlich kürzen
      result.tips = result.tips.slice(0, 3);
      if (result.tips.length === 0) result.tips.push("Sieht gut aus ✅");

      return result;
    }

    function hasSequentialRun(pw) {
      const s = pw.toLowerCase();
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const digits = "0123456789";
      for (let i = 0; i <= s.length - 4; i++) {
        const part = s.slice(i, i + 4);
        if (alphabet.includes(part)) return true;
        if (digits.includes(part)) return true;
      }
      return false;
    }

    // ========= UI Steuerung =========
    function setOverlayVisible(visible) {
      passwordInput.style.display = visible ? "block" : "none";
      toggleBtn.style.display = visible ? "block" : "none";
      copyBtn.style.display = visible ? "block" : "none";
      if (visible) passwordInput.focus();
    }

    canvasBtn.addEventListener("click", () => {
      canvasBtn.style.display = "none";
      showHackScreen = true;
      setOverlayVisible(true);
    });

    // Maus: Klick auf Canvas fokussiert Eingabe
    canvas.addEventListener("mousedown", () => {
      if (showHackScreen) passwordInput.focus();
    });

    // Live: wenn du tippst, Bewertung zurücksetzen (oder: live bewerten – kannst du unten aktivieren)
    passwordInput.addEventListener("input", () => {
      analysis = null;
      // Wenn du LIVE bewerten willst, nimm stattdessen:
      // analysis = analyzePassword(passwordInput.value);
    });

    // Enter bewertet
    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        analysis = analyzePassword(passwordInput.value);
      }
      if (e.key === "Escape") {
        passwordInput.value = "";
        analysis = null;
      }
    });

    // 👁 Toggle: password/text
    toggleBtn.addEventListener("click", () => {
      passwordInput.type = (passwordInput.type === "password") ? "text" : "password";
      passwordInput.focus();
    });

    // 📋 Copy Button (Clipboard API)
    copyBtn.addEventListener("click", async () => {
      const pw = passwordInput.value;
      if (!pw) return;

      try {
        await navigator.clipboard.writeText(pw);
        // kleines Feedback (optional)
        copyBtn.textContent = "✅";
        setTimeout(() => (copyBtn.textContent = "📋"), 500);
      } catch {
        // Fallback: markieren zum manuellen Kopieren
        passwordInput.type = "text";
        passwordInput.focus();
        passwordInput.select();
      }
    });

    // ========= Drawing =========
    function drawStart() {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(hackPhoneImage, 0, 0, width, height);
    }

    function drawHackScreen() {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(cellPhoneImage, 0, 0, width, height);

      // Info/Ergebnisbox
      const boxX = 18, boxY = 200, boxW = width, boxH = 200;

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#25797cff";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#a51212ff";
      ctx.font = "italic small-caps 900 13px sans-serif";
      ctx.fillText("Enter = prüfen | Esc = leeren | 👁 = anzeigen/verstecken | 📋 = kopieren", boxX + 10, boxY + 10);

      if (!analysis) {
        ctx.fillText("Tipp: Tippe ein Passwort ins Feld oben und drücke Enter.", boxX + 10, boxY + 40);
      } else {
        ctx.fillText(`Score: ${analysis.score}/100`, boxX + 10, boxY + 40);
        ctx.fillText(`Bewertung: ${analysis.label}`, boxX + 10, boxY + 60);
        ctx.fillText("Tipps:", boxX + 10, boxY + 90);
        for (let i = 0; i < analysis.tips.length; i++) {
          ctx.fillText(`- ${analysis.tips[i]}`, boxX + 10, boxY + 110 + i * 18);
        }
      }

      // Dein roter Text unten (optional)
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = "italic small-caps 700 20px Montserrat";
      ctx.fillStyle = '#2860faff';
      ctx.fillText('Passwort-Stärke-Check', 135, height - 50);
      ctx.fillText('Gib ein Passwort ein und drücke Enter', 210, height - 30);
    }

    function loop() {
      if (showHackScreen) drawHackScreen();
      else drawStart();
      requestAnimationFrame(loop);
    }

    loop();
  }

  window.addEventListener('load', HackBruteforce);
})();