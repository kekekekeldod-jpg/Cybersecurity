// MEGA DDOS-ATTACK PROTECTION (hardened + cleaned)

import dotenv from "dotenv";
import helmet from "helmet";
import Database from "better-sqlite3";
import express from "express";
import argon2 from "argon2";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import SQLiteStoreFactory from "better-sqlite3-session-store";

dotenv.config();

// Argon2 Settings
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, //64MB
  timeCost: 3,
  parallelism: 1,
};

// Pfad-Helfer (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade zum Frontend
const FRONTEND_ROOT = path.resolve(__dirname, "../Frontend");
const PROTECTED_ROOT = path.resolve(__dirname, "../Frontend/protected");

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "user.db");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET missing");
}
const SESSION_SECRET = process.env.SESSION_SECRET;

// --- DB: Ordner anlegen falls nötig
const RAW_DB_PATH = DB_PATH.trim();
const DATA_DIR = path.dirname(RAW_DB_PATH);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log("📁 DB-Ordner geprüft:", DATA_DIR);
console.log("🗄️ DB-Datei:", RAW_DB_PATH);

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
    fingerprint TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    path TEXT,
    method TEXT,
    user_agent TEXT,
    referer TEXT,
    status INTEGER,
    response_time_ms INTEGER,
    session_id TEXT,
    user_id INTEGER,
    fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  session_id TEXT,
  user_id INTEGER,
  device_id TEXT,
  risk_score INTEGER DEFAULT 0,
  fingerprint TEXT NOT NULL,
  user_agent TEXT,
  first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

  CREATE TABLE IF NOT EXISTS blocked_ips (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
  );

  CREATE INDEX IF NOT EXISTS idx_login_logs_ip_time
    ON login_logs(ip, timestamp);

  CREATE INDEX IF NOT EXISTS idx_login_logs_email_time
    ON login_logs(email_attempt, timestamp);

  CREATE INDEX IF NOT EXISTS idx_access_logs_ip_time
    ON access_logs(ip, created_at);

  CREATE INDEX IF NOT EXISTS idx_access_logs_user_time
    ON access_logs(user_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_fingerprints_ip_time
    ON fingerprints(ip, created_at);

  CREATE INDEX IF NOT EXISTS idx_fingerprints_device_id
    ON fingerprints(device_id);

  CREATE INDEX IF NOT EXISTS idx_fingerprints_user_id
    ON fingerprints(user_id);

  CREATE INDEX IF NOT EXISTS idx_fingerprints_last_seen
    ON fingerprints(last_seen_at);
`);

const app = express();

 // Proxy-Vertrauen (wichtig: VOR Limitern & Sessions)
 // Internet -> nginx -> node  => 1 Proxy ist korrekt.

app.set("trust proxy", 1);

// echte Client-IP (erste IP aus X-Forwarded-For)

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

// Sichere Header-Auslesung

function getSafeUserAgent(req) {
  return String(req.get("User-Agent") || "").slice(0, 1000);
}

function getSafeReferer(req) {
  return String(req.get("Referer") || "").slice(0, 1000);
}

// Fingerprint normalisieren und begrenzen

function normalizeFingerprint(input) {
  if (!input || typeof input !== "object") return null;

  const fp = {
    deviceId: String(input.deviceId || "").slice(0, 128),

    userAgent: String(input.userAgent || "").slice(0, 500),
    language: String(input.language || "").slice(0, 100),
    languages: Array.isArray(input.languages) ? input.languages.slice(0, 10) : [],

    screen: String(input.screen || "").slice(0, 50),
    availScreen: String(input.availScreen || "").slice(0, 50),
    colorDepth: Number(input.colorDepth || 0),
    pixelRatio: Number(input.pixelRatio || 1),

    timezone: String(input.timezone || "").slice(0, 100),
    platform: String(input.platform || "").slice(0, 100),

    hardwareConcurrency: Number(input.hardwareConcurrency || 0),
    deviceMemory: Number(input.deviceMemory || 0),
    maxTouchPoints: Number(input.maxTouchPoints || 0),

    cookieEnabled: Boolean(input.cookieEnabled),
    online: Boolean(input.online),

    connection: {
      effectiveType: String(input.connection?.effectiveType || "").slice(0, 50),
      rtt: Number(input.connection?.rtt || 0),
      downlink: Number(input.connection?.downlink || 0),
      saveData: Boolean(input.connection?.saveData || false),
    },

    gpuVendor: String(input.gpuVendor || "").slice(0, 300),
    gpuRenderer: String(input.gpuRenderer || "").slice(0, 300),

    webglVendor: String(input.webglVendor || "").slice(0, 300),
    webglRenderer: String(input.webglRenderer || "").slice(0, 300),
    webglVersion: String(input.webglVersion || "").slice(0, 300),
    webglShadingLanguageVersion: String(input.webglShadingLanguageVersion || "").slice(0, 300),

    canvasFingerprint: String(input.canvasFingerprint || "").slice(0, 300),

    uaData: input.uaData && typeof input.uaData === "object" ? input.uaData : {}
  };

  return JSON.stringify(fp);
}

function getDeviceIdFromRawFingerprint(input) {
  if (!input || typeof input !== "object") return null;
  return String(input.deviceId || "").slice(0, 128) || null;
}

function calculateRiskScore(input, ip = "") {
  if (!input || typeof input !== "object") return 0;

  let score = 0;

  if (!input.userAgent) score += 20;
  if (!input.language) score += 5;
  if (!input.screen) score += 10;
  if (!input.timezone) score += 10;
  if (!input.platform) score += 10;
  if (!input.gpuRenderer) score += 10;
  if (!input.canvasFingerprint) score += 10;

  if (ip && (ip.startsWith("127.") || ip === "::1")) score += 5;

  return score;
}

function findKnownDevice(deviceId) {
  if (!deviceId) return null;

  return db.prepare(`
    SELECT id, user_id, ip, device_id, risk_score, last_seen_at
    FROM fingerprints
    WHERE device_id = ?
      AND user_id IS NOT NULL
    ORDER BY last_seen_at DESC, id DESC
    LIMIT 1
  `).get(deviceId);
}

// Fingerprint speichern

function saveFingerprint({
  ip,
  sessionId = null,
  userId = null,
  userAgent = "",
  fingerprint = null,
  deviceId = null,
  riskScore = 0
}) {
  if (!fingerprint) return;

  try {
    if (deviceId) {
      const updateResult = db.prepare(`
        UPDATE fingerprints
        SET
          ip = ?,
          session_id = ?,
          user_id = COALESCE(?, user_id),
          risk_score = ?,
          fingerprint = ?,
          user_agent = ?,
          last_seen_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE device_id = ?
      `).run(
        ip,
        sessionId,
        userId,
        riskScore,
        fingerprint,
        userAgent,
        deviceId
      );

      if (updateResult.changes === 0) {
        db.prepare(`
          INSERT INTO fingerprints (
            ip, session_id, user_id, device_id, risk_score, fingerprint, user_agent,
            first_seen_at, last_seen_at, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(
          ip,
          sessionId,
          userId,
          deviceId,
          riskScore,
          fingerprint,
          userAgent
        );
      }
    } else {
      db.prepare(`
        INSERT INTO fingerprints (
          ip, session_id, user_id, device_id, risk_score, fingerprint, user_agent,
          first_seen_at, last_seen_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        ip,
        sessionId,
        userId,
        deviceId,
        riskScore,
        fingerprint,
        userAgent
      );
    }
  } catch (e) {
    console.error("saveFingerprint error:", e?.message || e);
  }
}

// Geblockte IPs prüfen / setzen

function isIpBlocked(ip) {
  const row = db.prepare(`
    SELECT ip
    FROM blocked_ips
    WHERE ip = ?
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `).get(ip);

  return !!row;
}

function blockIp(ip, reason = "abuse", minutes = 10) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO blocked_ips (ip, reason, expires_at)
      VALUES (?, ?, datetime('now', ?))
    `).run(ip, reason, `+${minutes} minutes`);
  } catch (e) {
    console.error("blockIp error:", e?.message || e);
  }
}

// Login-Bruteforce zusätzlich pro IP + E-Mail erkennen

function isLoginBlocked(ip, email) {
  const row = db.prepare(`
    SELECT COUNT(*) as attempts
    FROM login_logs
    WHERE ip = ?
      AND email_attempt = ?
      AND success = 0
      AND timestamp > datetime('now', '-10 minutes')
  `).get(ip, email);

  return (row?.attempts || 0) >= 5;
}

// Speicherbereinigung für Shield-Map

function cleanupIpBuckets(ipBuckets, windowMs) {
  const now = Date.now();
  for (const [ip, bucket] of ipBuckets) {
    if (now - bucket.start > windowMs * 2) {
      ipBuckets.delete(ip);
    }
  }
}

 // SICHERHEIT: Helmet (CSP etc.)
 // HSTS bleibt aus, weil nginx das bereits setzt.

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

// Body-Limits (Schutz gegen riesige JSON- oder Form-Requests)

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

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

// Geblockte IPs sofort stoppen

app.use((req, res, next) => {
  const ip = getClientIp(req);

  if (isIpBlocked(ip)) {
    return res.status(403).send("Access denied");
  }

  next();
});

 // Shield-Middleware:
 // zählt Requests pro IP in einem 30s-Fenster
 // wenn > SHIELD_MAX_REQ → 429 Too Many Requests

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
    blockIp(ip, "rate-limit abuse", 10);
    return res.status(429).send("Too many requests from this IP. Please slow down.");
  }

  // Memory-safety: früher aufräumen (verteilte Attacken = viele IPs)
  if (ipBuckets.size > 2000) {
    cleanupIpBuckets(ipBuckets, SHIELD_WINDOW_MS);
  }

  next();
});

app.use(speedLimiter);
app.use(globalLimiter);

 // Session / Cookies (mit SQLite Store statt MemoryStore)

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

 // Request-Logger -> in DB (access_logs)

app.use((req, res, next) => {
  const start = Date.now();
  const ip = getClientIp(req);
  const ua = getSafeUserAgent(req);
  const referer = getSafeReferer(req);

  res.on("finish", () => {
    try {
      db.prepare(
        `INSERT INTO access_logs (
          ip, path, method, user_agent, referer, status,
          response_time_ms, session_id, user_id, fingerprint
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        ip,
        req.originalUrl || req.url,
        req.method,
        ua,
        referer,
        res.statusCode || 0,
        Date.now() - start,
        req.sessionID || null,
        req.session?.userId || null,
        req.session?.fingerprint || null
      );
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

function logLogin({ userId = null, emailAttempt = null, success = 0, ip = "", ua = "", fingerprint = null }) {
  try {
    db.prepare(
      `INSERT INTO login_logs (user_id, email_attempt, success, ip, user_agent, fingerprint)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(userId, emailAttempt, success, ip, ua, fingerprint);
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

// Fingerprint separat erfassen und Session zuordnen

app.post("/api/fingerprint", (req, res) => {
  try {
    const ip = getClientIp(req);
    const ua = getSafeUserAgent(req);
    const fingerprint = normalizeFingerprint(req.body);
    const deviceId = getDeviceIdFromRawFingerprint(req.body);
    const riskScore = calculateRiskScore(req.body, ip);

    if (fingerprint) {
      req.session.fingerprint = fingerprint;
      req.session.deviceId = deviceId || null;

      saveFingerprint({
        ip,
        sessionId: req.sessionID || null,
        userId: req.session?.userId || null,
        userAgent: ua,
        fingerprint,
        deviceId,
        riskScore
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("fingerprint route error:", e?.message || e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});


const hasAt = /@/;
app.use("/auth", authLimiter);

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, fingerprint: fpRaw } = req.body || {};
    if (
  typeof email !== "string" ||
  typeof password !== "string" ||
  !email.trim() ||
  !password
) {
  return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });
} else if (
  !hasAt.test(email)
){
  return res.status(400).json({error: "Bitte nutzte auch wirklich eine E-mail"});
}

    // Optional Email normalisieren
    const emailNorm = email.trim().toLowerCase();
    const ip = getClientIp(req);
    const ua = getSafeUserAgent(req);
    const fingerprint = normalizeFingerprint(fpRaw);
    const deviceId = getDeviceIdFromRawFingerprint(fpRaw);
    const riskScore = calculateRiskScore(fpRaw, ip);

    const hash = await argon2.hash(password, ARGON2_OPTIONS);

    const info = db
      .prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`)
      .run(emailNorm, hash);

    // Fingerprint direkt bei Registrierung verknüpfen
    if (fingerprint) {
      req.session.fingerprint = fingerprint;
      req.session.deviceId = deviceId || null;

      saveFingerprint({
        ip,
        sessionId: req.sessionID || null,
        userId: Number(info.lastInsertRowid),
        userAgent: ua,
        fingerprint,
        deviceId,
        riskScore
      });
    }

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
    const { email, password, fingerprint: fpRaw } = req.body || {};
    const ip = getClientIp(req);
    const ua = getSafeUserAgent(req);
    const fingerprint = normalizeFingerprint(fpRaw);

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      logLogin({
        userId: null,
        emailAttempt: null,
        success: 0,
        ip,
        ua,
        fingerprint
      });

      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });
    }

    const emailNorm = email.trim().toLowerCase();
    const deviceId = getDeviceIdFromRawFingerprint(fpRaw);
    const riskScore = calculateRiskScore(fpRaw, ip);
    const knownDevice = findKnownDevice(deviceId);

    // Login-Bruteforce zusätzlich auf DB-Basis
    if (isLoginBlocked(ip, emailNorm)) {
      return res.status(429).json({ error: "Zu viele Login-Versuche. Bitte später erneut versuchen." });
    }

    const row = db
      .prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
      .get(emailNorm);

    if (!row) {
      logLogin({ emailAttempt: emailNorm, success: 0, ip, ua, fingerprint });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    const ok = await argon2.verify(row.password_hash, password);

    if (!ok) {
      logLogin({ userId: row.id, emailAttempt: emailNorm, success: 0, ip, ua, fingerprint });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    if (knownDevice && knownDevice.user_id && knownDevice.user_id !== row.id) {
      logLogin({ userId: row.id, emailAttempt: emailNorm, success: 0, ip, ua, fingerprint });
      return res.status(403).json({ error: "Gerät ist bereits einem anderen Konto zugeordnet." });
    }

    // Session Fixation Protection, neue Session-ID nach Login
    req.session.regenerate((err) => {
      if (err) {
        console.error("session regenerate error:", err);
        return res.status(500).json({ error: "Session error" });
      }

      req.session.userId = row.id;
      req.session.email = emailNorm;

      if (fingerprint) req.session.fingerprint = fingerprint;
      if (deviceId) req.session.deviceId = deviceId;

      logLogin({ userId: row.id, emailAttempt: emailNorm, success: 1, ip, ua, fingerprint });

      if (fingerprint) {
        saveFingerprint({
          ip,
          sessionId: req.sessionID || null,
          userId: row.id,
          userAgent: ua,
          fingerprint,
          deviceId,
          riskScore
        });
      }

      return res.json({ ok: true, email: emailNorm });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/logout", (req, res) => {
  // Cookie aktiv löschen
  req.session.destroy(() => {
    res.clearCookie("sid", { httpOnly: true, sameSite: "lax", secure: true });
    res.json({ ok: true });
  });
});

app.get("/auth/whoami", (req, res) => {
  if (req.session?.userId) return res.json({ ok: true, email: req.session.email });
  res.json({ ok: false });
});

// Neue Admin-/Analyse-Routen

app.get("/admin/security/top-ips", requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ip, COUNT(*) as hits
      FROM access_logs
      WHERE created_at > datetime('now', '-1 hour')
      GROUP BY ip
      ORDER BY hits DESC
      LIMIT 20
    `).all();

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.get("/admin/security/top-fingerprints", requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT fingerprint, COUNT(*) as seen
      FROM fingerprints
      GROUP BY fingerprint
      ORDER BY seen DESC
      LIMIT 20
    `).all();

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.get("/admin/security/top-devices", requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT device_id, COUNT(*) as seen, MAX(last_seen_at) as last_seen
      FROM fingerprints
      WHERE device_id IS NOT NULL AND device_id != ''
      GROUP BY device_id
      ORDER BY seen DESC
      LIMIT 50
    `).all();

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.get("/admin/security/device/:deviceId", requireAuth, (req, res) => {
  try {
    const deviceId = String(req.params.deviceId || "");

    const rows = db.prepare(`
      SELECT id, ip, session_id, user_id, device_id, risk_score, user_agent, created_at, last_seen_at, fingerprint
      FROM fingerprints
      WHERE device_id = ?
      ORDER BY id DESC
      LIMIT 100
    `).all(deviceId);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

 // PROTECTED STATIC

app.use(
  "/member",
  requireAuth,
  noCache,
  express.static(PROTECTED_ROOT, { index: false, etag: false, maxAge: 0 })
);

app.get("/member/white-hat-hacker", requireAuth, noCache, (_req, res) => {
  res.sendFile(path.join(PROTECTED_ROOT, "white-hat-hacker.html"));
});

// PUBLIC STATIC

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


// Error-Handler (Fallback)

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Ungültiges JSON" });
  }

  console.error("Unhandled error:", err?.stack || err);
  if (!res.headersSent) res.status(500).send("Interner Serverfehler");
  else next();
});

// Start server

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server läuft hinter nginx. Local: http://127.0.0.1:${PORT}`);
});