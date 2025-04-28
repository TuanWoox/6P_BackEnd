const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanTypeInterestRatesSchema = new Schema(
  {
    moneyAddOnOverdue: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    monthlyInterestRate: { type: Number, required: true },
    loanType: { type: Schema.Types.ObjectId, ref: "LoanType", required: true },
  },
  { timestamps: true }
);

const LoanTypeInterestRates = mongoose.model(
  "LoanTypeInterestRates",
  loanTypeInterestRatesSchema
);

module.exports = LoanTypeInterestRates;
