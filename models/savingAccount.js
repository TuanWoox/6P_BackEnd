const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");

const savingAccountSchema = new Schema(
  {
    savingTypeInterest: {
      type: Schema.Types.ObjectId,
      ref: "SavingTypeInterest",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "MATURED", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const SavingAccount = Account.discriminator("SavingAccount", savingAccountSchema);

module.exports = SavingAccount;
