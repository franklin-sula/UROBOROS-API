const express = require("express");
const router = express.Router();
const { acceptInvite } = require("../services/inviteService");
const validateAcceptInvite = require("../middleware/validateAcceptInvite");

router.post("/accept-invite", validateAcceptInvite, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    const result = await acceptInvite(token);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
