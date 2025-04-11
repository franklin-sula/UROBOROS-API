const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { timeOutAttendee } = require("../services/timeOutService");
const authMiddleware = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Validation middleware
const validateTimeOut = [
  check("attendeeId").notEmpty().withMessage("Attendee ID is required"),
  check("selectedParentsEmails")
    .isArray()
    .withMessage("Selected parents emails must be an array"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Route to time out an attendee
router.post(
  "/time-out-attendee",
  authMiddleware,
  limiter,
  validateTimeOut,
  async (req, res) => {
    try {
      const { attendeeId, selectedParentsEmails } = req.body;
      console.log("Timing out attendee:", attendeeId);
      console.log("Notifying parents:", selectedParentsEmails);
      const result = await timeOutAttendee(attendeeId, selectedParentsEmails);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in /time-out-attendee route:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
