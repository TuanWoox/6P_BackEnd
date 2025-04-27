const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    minIncomeRequired: { type: Number, required: true },
    maxIncomeRequired: { type: Number, required: true },
    maxLimit: { type: Number, required: true },
    minLimit: { type: Number, required: true },
  },
  { timestamps: true }
);

const LoanType = mongoose.model("LoanType", loanTypeSchema);

module.exports = LoanType;
