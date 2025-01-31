require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const inviteRoutes = require("./routes/invite");
const publicRoutes = require("./routes/publicRoutes");
const authMiddleware = require("./middleware/auth");

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://togatherinv1.vercel.app",
    process.env.FRONTEND_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors());
app.use(express.json());

// Routes
app.use("/", publicRoutes);
app.use("/accept-invite", publicRoutes);
app.use("/invite", authMiddleware, inviteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
