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
    nextEarningDate: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now;
      },
    },
    finishEarningDate: {
      type: Date,
    },
    // totalEarning: {
    //   type: Number,
    //   default: 0,
    // },
    status: {
      type: String,
      enum: ["ACTIVE", 
        // "MATURED", 
        "CLOSED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const SavingAccount = Account.discriminator(
  "SavingAccount",
  savingAccountSchema
);

module.exports = SavingAccount;
