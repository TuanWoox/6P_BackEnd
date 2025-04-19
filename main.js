require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const authRoute = require("./routes/auth");
const otpRoute = require("./routes/otp");

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// If you're also accepting form submissions
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

connectDB();
app.use("/auth", authRoute);
app.use("/otp", otpRoute);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
