const express = require("express");
const router = express.Router();
const { createInvite } = require("../services/inviteService");
const rateLimit = require("express-rate-limit");
const validateInvite = require("../middleware/validateInvite");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const getUserId = (req) => {
  console.log("Getting user ID from:", req.user);
  if (!req.user || !req.user.id) {
    throw new Error("User ID not found");
  }
  return req.user.id;
};

const getUserName = (req) => {
  console.log("Getting user name from:", req.user);
  if (!req.user || !req.user.name) {
    throw new Error("User name not found");
  }
  return `${req.user.first_name} ${req.user.last_name}`;
};

const getUserEmail = (req) => {
  console.log("Getting user email from:", req.user);
  if (!req.user || !req.user.email) {
    throw new Error("User email not found");
  }
  return req.user.email;
};

router.post("/send-invite", limiter, validateInvite, async (req, res) => {
  console.log("Request user object:", req.user);

  try {
    const { email } = req.body;
    const inviterId = getUserId(req);
    const inviterEmail = getUserEmail(req);
    const inviterName = getUserName(req);

    // Check if email is the same as inviter
    if (email === inviterEmail) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }

    const result = await createInvite(
      email,
      inviterId,
      inviterEmail,
      inviterName
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /send-invite route:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
