require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const inviteRoutes = require("./routes/invite");
const publicRoutes = require("./routes/publicRoutes");
const authMiddleware = require("./middleware/auth");

const allowedOrigins = [
  "http://localhost:3000",
  "https://togatherinv1.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the origin in the response
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Add custom CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Routes
app.use("/", publicRoutes);
app.use("/accept-invite", publicRoutes);
app.use("/invite", authMiddleware, inviteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
