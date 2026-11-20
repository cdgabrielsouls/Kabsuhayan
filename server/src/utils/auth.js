const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters.");
  }
  return secret;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [algorithm, salt, hashHex] = String(storedHash || "").split("$");
  if (algorithm !== "scrypt" || !salt || !hashHex || hashHex.length !== 128) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function signToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  })).toString("base64url");
  const body = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", getJwtSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
  if (header.alg !== "HS256") throw new Error("Invalid token");

  const body = `${headerPart}.${payloadPart}`;
  const expected = crypto.createHmac("sha256", getJwtSecret()).update(body).digest();
  const supplied = Buffer.from(signaturePart, "base64url");
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  if (!payload.sub || !Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }
  return payload;
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
