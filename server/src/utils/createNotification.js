const Notification = require("../models/Notification");

async function createNotification({ userId, type, title, message, link }) {
  if (!userId) return;
  return Notification.create({ userId, type, title, message, link });
}

module.exports = createNotification;
