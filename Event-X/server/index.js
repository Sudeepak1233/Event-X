import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";

const scrypt = promisify(scryptCallback);
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(serverDirectory, "..");
dotenv.config({ path: path.join(projectDirectory, ".env.local") });

const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
const ownerPassword = process.env.OWNER_PASSWORD;

if (!ownerEmail || !ownerPassword || ownerPassword.length < 8) {
  throw new Error(
    "Set OWNER_EMAIL and an OWNER_PASSWORD of at least 8 characters in .env.local."
  );
}

const dataDirectory = path.join(serverDirectory, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, "event-x.sqlite"));
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS owner_accounts (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS owner_sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    organizer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
  CREATE INDEX IF NOT EXISTS events_organizer_idx ON events(organizer_email);
`);
const ownerSessionColumns = database.pragma("table_info(owner_sessions)");
if (!ownerSessionColumns.some((column) => column.name === "email")) {
  database.exec("ALTER TABLE owner_sessions ADD COLUMN email TEXT NOT NULL DEFAULT ''");
}

const ownerSalt = randomBytes(16);
const ownerHash = await scrypt(ownerPassword, ownerSalt, 64);
database.prepare(`
  INSERT INTO owner_accounts (id, email, password_salt, password_hash)
  VALUES (1, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    email = excluded.email,
    password_salt = excluded.password_salt,
    password_hash = excluded.password_hash
`).run(ownerEmail, ownerSalt.toString("hex"), ownerHash.toString("hex"));
database.prepare("DELETE FROM owner_sessions").run();

const app = express();
const port = Number(process.env.PORT || 8787);
const sessionCookieName = "eventx_owner_session";
const sessionDurationMs = 8 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  next();
});
app.use(express.json({ limit: "25kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

const hashSessionToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const readSessionToken = (request) => {
  const cookies = String(request.headers.cookie || "")
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .filter(([name]) => name);

  return cookies.find(([name]) => name === sessionCookieName)?.[1] || null;
};

const getOwnerSession = (request) => {
  const token = readSessionToken(request);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = database.prepare(`
    SELECT email, expires_at
    FROM owner_sessions
    WHERE token_hash = ?
  `).get(tokenHash);

  if (!session || session.expires_at <= Date.now()) {
    database.prepare("DELETE FROM owner_sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }

  return { email: session.email, role: "owner" };
};

const requireOwner = (request, response, next) => {
  const owner = getOwnerSession(request);
  if (!owner) {
    response.status(401).json({ error: "Owner authentication required." });
    return;
  }

  request.owner = owner;
  next();
};

const validateEvent = (input, { requireId = false } = {}) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const title = String(input.title || "").trim();
  const category = String(input.category || "").trim();
  const date = String(input.date || "").trim();
  const time = String(input.time || "").trim();
  const location = String(input.location || "").trim();
  const organizerEmail = String(input.organizerEmail || "").trim().toLowerCase();
  const price = Number(input.price);

  if (
    (requireId && !String(input.id || "").trim()) ||
    !title ||
    title.length > 160 ||
    !category ||
    category.length > 80 ||
    !date ||
    date.length > 80 ||
    !time ||
    time.length > 40 ||
    !location ||
    location.length > 160 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail) ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return null;
  }

  return {
    id: requireId ? String(input.id).trim() : randomUUID(),
    title,
    category,
    date,
    time,
    location,
    price,
    description: String(input.description || "").trim().slice(0, 4000),
    image: String(input.image || "").trim().slice(0, 1000),
    organizerEmail
  };
};

const eventColumns = `
  id, title, category, date, time, location, price, description, image,
  organizer_email AS organizerEmail, status
`;
const saveEvent = database.prepare(`
  INSERT OR IGNORE INTO events
    (id, title, category, date, time, location, price, description, image, organizer_email, status)
  VALUES
    (@id, @title, @category, @date, @time, @location, @price, @description, @image, @organizerEmail, @status)
`);

app.post("/api/auth/login", loginLimiter, async (request, response, next) => {
  try {
    const email = String(request.body?.email || "").trim().toLowerCase();
    const password = request.body?.password;
    const account = database.prepare(`
      SELECT email, password_salt, password_hash
      FROM owner_accounts
      WHERE id = 1 AND email = ?
    `).get(email);

    if (typeof password !== "string" || !account) {
      response.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const salt = Buffer.from(account.password_salt, "hex");
    const expectedHash = Buffer.from(account.password_hash, "hex");
    const suppliedHash = await scrypt(password, salt, expectedHash.length);

    if (!timingSafeEqual(expectedHash, suppliedHash)) {
      response.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + sessionDurationMs;
    database.prepare(`
      INSERT INTO owner_sessions (token_hash, email, expires_at)
      VALUES (?, ?, ?)
    `).run(hashSessionToken(token), account.email, expiresAt);

    response.cookie(sessionCookieName, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      path: "/",
      maxAge: sessionDurationMs
    });
    response.json({ user: { email: account.email, role: "owner" } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/session", (request, response) => {
  const owner = getOwnerSession(request);
  if (!owner) {
    response.status(401).json({ error: "Owner authentication required." });
    return;
  }
  response.json({ user: owner });
});

app.post("/api/auth/logout", (request, response) => {
  const token = readSessionToken(request);
  if (token) {
    database.prepare("DELETE FROM owner_sessions WHERE token_hash = ?")
      .run(hashSessionToken(token));
  }
  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/"
  });
  response.status(204).end();
});

app.get("/api/events", (request, response) => {
  const events = database.prepare(`
    SELECT ${eventColumns}
    FROM events
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `).all();
  response.json({ events });
});

app.get("/api/organizer/events", (request, response) => {
  const email = String(request.query.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: "A valid organizer email is required." });
    return;
  }

  const events = database.prepare(`
    SELECT ${eventColumns}
    FROM events
    WHERE organizer_email = ?
    ORDER BY created_at DESC
  `).all(email);
  response.json({ events });
});

app.post("/api/events", (request, response) => {
  const event = validateEvent(request.body);
  if (!event) {
    response.status(400).json({ error: "Event details are invalid." });
    return;
  }

  saveEvent.run({ ...event, status: "pending" });
  const savedEvent = database.prepare(`
    SELECT ${eventColumns} FROM events WHERE id = ?
  `).get(event.id);
  response.status(201).json({ event: savedEvent });
});

app.delete("/api/events/:id", (request, response) => {
  const organizerEmail = String(request.body?.organizerEmail || "")
    .trim()
    .toLowerCase();
  const result = database.prepare(`
    DELETE FROM events WHERE id = ? AND organizer_email = ?
  `).run(request.params.id, organizerEmail);
  if (!result.changes) {
    response.status(404).json({ error: "Event not found." });
    return;
  }
  response.status(204).end();
});

app.post("/api/owner/events/import", requireOwner, (request, response) => {
  const events = request.body?.events;
  const approvedIds = new Set((request.body?.approvedIds || []).map(String));
  const rejectedIds = new Set((request.body?.rejectedIds || []).map(String));

  if (!Array.isArray(events) || events.length > 1000) {
    response.status(400).json({ error: "Event import payload is invalid." });
    return;
  }

  const importEvents = database.transaction((items) => {
    for (const item of items) {
      const event = validateEvent(item, { requireId: true });
      if (!event) throw new Error("An imported event has invalid fields.");

      const status = approvedIds.has(event.id)
        ? "approved"
        : rejectedIds.has(event.id)
          ? "rejected"
          : "pending";
      saveEvent.run({ ...event, status });
    }
  });

  try {
    importEvents(events);
    response.status(204).end();
  } catch (error) {
    if (error.message === "An imported event has invalid fields.") {
      response.status(400).json({ error: error.message });
      return;
    }
    throw error;
  }
});

app.get("/api/owner/events", requireOwner, (request, response) => {
  const events = database.prepare(`
    SELECT ${eventColumns}
    FROM events
    ORDER BY created_at DESC
  `).all();
  response.json({ events });
});

app.patch("/api/owner/events/:id/status", requireOwner, (request, response) => {
  const status = request.body?.status;
  if (!["approved", "rejected"].includes(status)) {
    response.status(400).json({ error: "Status must be approved or rejected." });
    return;
  }

  const result = database.prepare(`
    UPDATE events SET status = ?
    WHERE id = ? AND status = 'pending'
  `).run(status, request.params.id);
  if (!result.changes) {
    response.status(404).json({ error: "Pending event not found." });
    return;
  }

  const event = database.prepare(`
    SELECT ${eventColumns} FROM events WHERE id = ?
  `).get(request.params.id);
  response.json({ event });
});

if (fs.existsSync(path.join(projectDirectory, "dist"))) {
  app.use(express.static(path.join(projectDirectory, "dist")));
  app.get(/^(?!\/api\/).*/, (request, response) => {
    response.sendFile(path.join(projectDirectory, "dist", "index.html"));
  });
}

app.use((error, request, response, next) => {
  console.error("API request failed.", error);
  if (response.headersSent) {
    next(error);
    return;
  }
  response.status(500).json({ error: "The server could not complete the request." });
});

app.listen(port, () => {
  console.log(`Event-X API listening on http://localhost:${port}`);
});
