const User = require("../models/User");
const { verifyToken } = require("../utils/auth");

async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: "Please log in first." });

  try {
    const payload = verifyToken(match[1]);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "This account is unavailable. Please log in again." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message?.includes("JWT_SECRET")) {
      return res.status(500).json({ message: "Authentication is not configured on the server." });
    }
    return res.status(401).json({ message: "Your session is invalid or has expired. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
