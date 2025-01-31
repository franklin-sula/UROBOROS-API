require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const inviteRoutes = require("./routes/invite");
const publicRoutes = require("./routes/publicRoutes");
const authMiddleware = require("./middleware/auth");

app.use(cors());
app.use(express.json());

// Routes
app.use("/", publicRoutes);
app.use("/invite", authMiddleware, inviteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
