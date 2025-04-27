const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");

const loanAccountSchema = new Schema(
  {
    monthlyPayment: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "ACTIVE",
        "CLOSED",
        "DEFAULTED",
      ],
      default: "ACTIVE",
    },
    loanTypeInterest: {
      type: Schema.Types.ObjectId,
      ref: "LoanTypeInterestRates",
      required: true,
    },
  },
  { timestamps: true }
);

const LoanAccount = Account.discriminator("LoanAccount", loanAccountSchema);

module.exports = LoanAccount;
