const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");
const checkingAccountSchema = new Schema({
  dailyTransactionLimit: { type: Number, required: true, default: 10000000 },
  overdraftProtection: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"],
    default: "ACTIVE",
  },
});

const checkingAccount = Account.discriminator(
  "CheckingAccount",
  checkingAccountSchema
);
module.exports = checkingAccount;
