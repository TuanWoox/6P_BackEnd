require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const authRoute = require("./routes/auth");
const otpRoute = require("./routes/otp");
const customerRoute = require("./routes/customer");
const transactionRoute = require("./routes/transaction");
const checkingAccountRoute = require("./routes/checkingAccount");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: process.env.FRONT_END_URI, // specific origin
    credentials: true, // allow credentials
  })
);
// Middleware to parse JSON bodies
app.use(express.json());
// If you're also accepting form submissions
app.use(express.urlencoded({ extended: true }));
// For reading JWT
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

connectDB();
app.use("/auth", authRoute);
app.use("/otp", otpRoute);
app.use("/transaction", transactionRoute);
app.use("/customer", customerRoute);
app.use("/checkingAccount", checkingAccountRoute);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
