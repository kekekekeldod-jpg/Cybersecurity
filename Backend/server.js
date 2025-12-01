// MEGA DDOS-ATTACK PROTECTION

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

dotenv.config();

// Pfad-Helfer (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade zum Frontend
const FRONTEND_ROOT = path.resolve(__dirname, "../Frontend");
const PROTECTED_ROOT = path.resolve(__dirname, "../Frontend/protected");

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || "./data/user.db";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "please_change_me_super_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

// --- DB: Ordner anlegen falls nötig
const RAW_DB_PATH = DB_PATH.trim();
const DATA_DIR = path.dirname(RAW_DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
console.log("📁 DB-Ordner geprüft:", DATA_DIR);

// DB öffnen
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
 * 1) SICHERHEIT: Helmet (CSP etc.)
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

/**
 * 2) Body-Limits (Schutz gegen riesige JSON- oder Form-Requests)
 */
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

/**
 * 3) Proxy-Vertrauen (damit IP über X-Forwarded-For korrekt ist – wichtig für Rate-Limit!)
 *    Das sollte VOR allen Limitern sein.
 */
app.set("trust proxy", 1);

/**
 * 4) Rate-Limiter & Slow-Down (app-seitiger DDoS-/Abuse-Schutz)
 */

// Globaler “Soft”-Limiter für alle Requests
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 200,           // max. 200 Requests / Minute / IP
  standardHeaders: true,
  legacyHeaders: false,
});

// "Bremsen" bei Spikes: nach X Requests pro Minute wird jede weitere Request verzögert
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 Minute
  delayAfter: 100,    // ab 100 Requests / Minute / IP
  delayMs: () => 500,      // jede weitere Request +500ms Delay
  validate: { delayMs: false } // Warnung abschalten
});

// Spezieller, harter Limiter nur für /auth (Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 Minuten
  max: 20,                   // max. 20 Login/Register-Requests / 15 Minuten / IP
  message: {
    error: "Zu viele Versuche. Bitte in ein paar Minuten erneut versuchen.",
  },
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
  const ip = (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  ).toString();

  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.start > SHIELD_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    ipBuckets.set(ip, bucket);
  }
  bucket.count++;

  if (bucket.count > SHIELD_MAX_REQ) {
    return res
      .status(429)
      .send("Too many requests from this IP. Please slow down.");
  }

  if (ipBuckets.size > 10000) {
    for (const [k, v] of ipBuckets) {
      if (now - v.start > SHIELD_WINDOW_MS * 2) {
        ipBuckets.delete(k);
      }
    }
  }

  next();
});

app.use(speedLimiter);
app.use(globalLimiter);

/**
 * 5) Session / Cookies
 */
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // secure: true, // bei HTTPS + Proxy aktivieren
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/**
 * 6) Request-Logger -> in DB (access_logs)
 */
app.use((req, res, next) => {
  const ip = (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  ).toString();
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
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

function logLogin({
  userId = null,
  emailAttempt = null,
  success = 0,
  ip = "",
  ua = "",
}) {
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
 * 7) AUTH-API (mit eigenem Rate-Limiter)
 */
app.use("/auth", authLimiter);

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-Mail und Passwort erforderlich" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = db
      .prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`)
      .run(email, hash);

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
      return res
        .status(400)
        .json({ error: "E-Mail und Passwort erforderlich" });
    }

    const row = db
      .prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
      .get(email);

    const ip = (
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      ""
    ).toString();
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
  if (req.session?.userId) return res.json({ ok: true, email: req.session.email });
  res.json({ ok: false });
});

/**
 * 8) PROTECTED STATIC
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
 * 9) PUBLIC STATIC
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
 * 10) Error-Handler (Fallback)
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.stack || err);
  if (!res.headersSent) res.status(500).send("Interner Serverfehler");
  else next();
});

/**
 * 11) Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 HTTP-Server läuft unter http://localhost:${PORT}`);
});