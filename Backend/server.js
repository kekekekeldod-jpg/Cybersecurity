// MEGA DDOS-ATTACK PROTECTION (hardened + cleaned)

import dotenv from "dotenv";
import helmet from "helmet";
import Database from "better-sqlite3";
import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import SQLiteStoreFactory from "better-sqlite3-session-store";

dotenv.config();

// Pfad-Helfer (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade zum Frontend
const FRONTEND_ROOT = path.resolve(__dirname, "../Frontend");
const PROTECTED_ROOT = path.resolve(__dirname, "../Frontend/protected");

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || "./data/user.db";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET missing");
}
const SESSION_SECRET = process.env.SESSION_SECRET;

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
if (!Number.isFinite(SALT_ROUNDS) || SALT_ROUNDS < 10 || SALT_ROUNDS > 16) {
  throw new Error("SALT_ROUNDS must be a number between 10 and 16");
}

// --- DB: Ordner anlegen falls nötig
const RAW_DB_PATH = DB_PATH.trim();
const DATA_DIR = path.dirname(RAW_DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
console.log("📁 DB-Ordner geprüft:", DATA_DIR);

// DB öffnen
const db = new Database(RAW_DB_PATH);
db.pragma("journal_mode = WAL"); // stabiler bei parallelen Zugriffen
db.pragma("foreign_keys = ON");

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

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    path TEXT,
    method TEXT,
    user_agent TEXT,
    status INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();

/**
 * 0) Proxy-Vertrauen (wichtig: VOR Limitern & Sessions)
 *    Internet -> nginx -> node  => 1 Proxy ist korrekt.
 */
app.set("trust proxy", 1);

/**
 * Helper: echte Client-IP (erste IP aus X-Forwarded-For)
 */
function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

/**
 * 1) SICHERHEIT: Helmet (CSP etc.)
 *    HSTS bleibt aus, weil nginx das bereits setzt.
 */
app.use(
  helmet({
    hsts: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],

        // JS erlauben (lokal + EmailJS CDN falls genutzt)
        "script-src": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdn.emailjs.com"
        ],

        // EmailJS API Calls erlauben
        "connect-src": [
          "'self'",
          "https://api.emailjs.com"
        ],

        // Bilder
        "img-src": ["'self'", "data:"],

        "style-src": [
          "'self'",
          "'unsafe-inline'"
        ],

        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
        "upgrade-insecure-requests": [],
      },
    },
  })
);

/**
 * 2) Body-Limits (Schutz gegen riesige JSON- oder Form-Requests)
 */
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

/**
 * 3) Rate-Limiter & Slow-Down (app-seitiger Abuse-Schutz)
 */

// Globaler “Soft”-Limiter für alle Requests
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 200, // max. 200 Requests / Minute / IP
  standardHeaders: true,
  legacyHeaders: false,
});

// "Bremsen" bei Spikes: ab X Requests pro Minute wird jede weitere Request verzögert
const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 100,
  delayMs: () => 500,
  validate: { delayMs: false }, // Warnung abschalten
});

// Spezieller, harter Limiter nur für /auth (Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Zu viele Versuche. Bitte in ein paar Minuten erneut versuchen." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Einfacher “Shield” für brutale Spikes (Sliding-Window, in-memory)
const SHIELD_WINDOW_MS = 30 * 1000;
const SHIELD_MAX_REQ = 400;
const ipBuckets = new Map();

/**
 * Shield-Middleware:
 * - zählt Requests pro IP in einem 30s-Fenster
 * - wenn > SHIELD_MAX_REQ → 429 Too Many Requests
 * - schützt vor "aus Versehen k6 ultra" von einer einzigen IP
 */
app.use((req, res, next) => {
  const now = Date.now();
  const ip = getClientIp(req);

  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.start > SHIELD_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    ipBuckets.set(ip, bucket);
  }
  bucket.count++;

  if (bucket.count > SHIELD_MAX_REQ) {
    return res.status(429).send("Too many requests from this IP. Please slow down.");
  }

  // Memory-safety: früher aufräumen (verteilte Attacken = viele IPs)
  if (ipBuckets.size > 2000) {
    for (const [k, v] of ipBuckets) {
      if (now - v.start > SHIELD_WINDOW_MS * 2) ipBuckets.delete(k);
    }
  }

  next();
});

app.use(speedLimiter);
app.use(globalLimiter);

/**
 * 4) Session / Cookies (mit SQLite Store statt MemoryStore)
 */
const SQLiteStore = SQLiteStoreFactory(session);

app.use(
  session({
    store: new SQLiteStore({
      client: db,
      // optional:
      // expired: { clear: true, intervalMs: 15 * 60 * 1000 }
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sid", // optional: eindeutiger Cookie-Name
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true, // weil nginx HTTPS macht
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/**
 * 5) Request-Logger -> in DB (access_logs)
 */
app.use((req, res, next) => {
  const ip = getClientIp(req);
  const ua = (req.get("User-Agent") || "").slice(0, 1000);

  res.on("finish", () => {
    try {
      db.prepare(
        `INSERT INTO access_logs (ip, path, method, user_agent, status)
         VALUES (?, ?, ?, ?, ?)`
      ).run(ip, req.originalUrl || req.url, req.method, ua, res.statusCode || 0);
    } catch (e) {
      console.error("DB log error:", e?.message || e);
    }
  });

  next();
});

// Hilfsfunktionen
function noCache(_req, res, next) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

function logLogin({ userId = null, emailAttempt = null, success = 0, ip = "", ua = "" }) {
  try {
    db.prepare(
      `INSERT INTO login_logs (user_id, email_attempt, success, ip, user_agent)
       VALUES (?, ?, ?, ?, ?)`
    ).run(userId, emailAttempt, success, ip, ua);
  } catch (e) {
    console.error("logLogin DB error:", e?.message || e);
  }
}

function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  if (req.accepts("html")) return res.redirect("/?auth=required");
  return res.status(401).json({ error: "Keine Berechtigung" });
}

/**
 * 6) AUTH-API (mit eigenem Rate-Limiter)
 */
app.use("/auth", authLimiter);

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });
    }

    // Optional (empfohlen): Email normalisieren
    const emailNorm = String(email).trim().toLowerCase();

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = db
      .prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`)
      .run(emailNorm, hash);

    res.json({ ok: true, userId: info.lastInsertRowid });
  } catch (e) {
    if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "E-mail existiert bereits" });
    }
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });
    }

    const ip = getClientIp(req);
    const ua = req.get("User-Agent") || "";

    const emailNorm = String(email).trim().toLowerCase();

    const row = db
      .prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
      .get(emailNorm);

    if (!row) {
      logLogin({ emailAttempt: emailNorm, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      logLogin({ userId: row.id, emailAttempt: emailNorm, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    // Session Fixation Protection: neue Session-ID nach Login
    req.session.regenerate((err) => {
      if (err) {
        console.error("session regenerate error:", err);
        return res.status(500).json({ error: "Session error" });
      }

      req.session.userId = row.id;
      req.session.email = emailNorm;

      logLogin({ userId: row.id, emailAttempt: emailNorm, success: 1, ip, ua });
      return res.json({ ok: true, email: emailNorm });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/logout", (req, res) => {
  // Optional: Cookie aktiv löschen
  req.session.destroy(() => {
    res.clearCookie("sid", { httpOnly: true, sameSite: "lax", secure: true });
    res.json({ ok: true });
  });
});

app.get("/auth/whoami", (req, res) => {
  if (req.session?.userId) return res.json({ ok: true, email: req.session.email });
  res.json({ ok: false });
});

/**
 * 7) PROTECTED STATIC
 */
app.use(
  "/member",
  requireAuth,
  noCache,
  express.static(PROTECTED_ROOT, { index: false, etag: false, maxAge: 0 })
);

app.get("/member/white-hat-hacker", requireAuth, noCache, (_req, res) => {
  res.sendFile(path.join(PROTECTED_ROOT, "white-hat-hacker.html"));
});

/**
 * 8) PUBLIC STATIC
 */
app.use(
  express.static(FRONTEND_ROOT, {
    index: "index.html",
    extensions: ["html"],
  })
);

// Fallback: nur für "Seiten"-Routen ohne Punkt
app.get("*", (req, res, next) => {
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(FRONTEND_ROOT, "index.html"));
});

/**
 * 9) Error-Handler (Fallback)
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.stack || err);
  if (!res.headersSent) res.status(500).send("Interner Serverfehler");
  else next();
});

/**
 * 10) Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server läuft hinter nginx. Local: http://127.0.0.1:${PORT}`);
});