// =============================================================
//  SERVER.JS  (Lokal-Version mit Debug-Logging für Tests)
// =============================================================

import dotenv from "dotenv";
import helmet from "helmet";
import Database from "better-sqlite3";
import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

// ---------------- Pfad-Helfer ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade
const FRONTEND_ROOT = path.resolve(__dirname, "../Frontend");
const PROTECTED_ROOT = path.resolve(__dirname, "../Frontend/protected");

// ---------------- ENV-Variablen ----------------
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "./data/user.db";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "please_change_me_super_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);


// =============================================================
// Express-App Setup
// =============================================================
const app = express();

app.use(
  helmet({
    hsts: false, // kein HTTPS-Zwang lokal
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "https:", "data:"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 Tag
    },
  })
);

// =============================================================
// SQLite-DB Setup
// =============================================================
const RAW_DB_PATH = DB_PATH.trim();
const DATA_DIR = path.dirname(RAW_DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
console.log("📁 DB-Ordner geprüft:", DATA_DIR);

const db = new Database(RAW_DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email_attempt TEXT,
    success INTEGER NOT NULL,
    ip TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// =============================================================
// Hilfsfunktionen
// =============================================================
function noCache(_req, res, next) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

function logLogin({ userId = null, emailAttempt = null, success = 0, ip = "", ua = "" }) {
  db.prepare(
    `INSERT INTO login_logs (user_id, email_attempt, success, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userId, emailAttempt, success, ip, ua);
}

function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  if (req.accepts("html")) return res.redirect("/?auth=required");
  return res.status(401).json({ error: "Keine Berechtigung" });
}

// =============================================================
// AUTH API
// =============================================================
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password)
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = db
      .prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`)
      .run(email, hash);

    res.json({ ok: true, userId: info.lastInsertRowid });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE")
      return res.status(409).json({ error: "E-Mail existiert bereits" });
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });

    const row = db
      .prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
      .get(email);
    const ip = req.ip;
    const ua = req.get("User-Agent") || "";

    if (!row) {
      logLogin({ emailAttempt: email, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      logLogin({ userId: row.id, emailAttempt: email, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    req.session.userId = row.id;
    req.session.email = email;
    logLogin({ userId: row.id, emailAttempt: email, success: 1, ip, ua });
    res.json({ ok: true, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/auth/whoami", (req, res) => {
  if (req.session?.userId)
    return res.json({ ok: true, email: req.session.email });
  res.json({ ok: false });
});

// =============================================================
// GESCHÜTZTER BEREICH /member
// =============================================================
app.use("/member", requireAuth, noCache,
  express.static(PROTECTED_ROOT, { index: false, etag: false, maxAge: 0 })
);

app.get("/member/caney", requireAuth, noCache, (_req, res) => {
  res.sendFile(path.join(PROTECTED_ROOT, "caney.html"));
});

// =============================================================
// ÖFFENTLICHER BEREICH
// =============================================================
app.use(express.static(FRONTEND_ROOT));

// Fallback auf index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, "index.html"));
});

// =============================================================
// START
// =============================================================
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server läuft auf http://localhost:${PORT}`)
);
