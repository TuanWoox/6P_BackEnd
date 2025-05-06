const mongoose = require("mongoose");
const { Schema } = mongoose;

const savingTypeInterestSchema = new Schema(
  {
    maturityPeriod: { type: Number, required: true },
    monthlyInterestRate: { type: Number, default: 0 },
    annualInterestRate: { type: Number, required: true },
    dailyInterestRate: { type: Number, default: 0 },
    savingType: {
      type: Schema.Types.ObjectId,
      ref: "SavingType",
      required: true,
    },
  },
  { timestamps: true }
);

const SavingTypeInterest = mongoose.model(
  "SavingTypeInterest",
  savingTypeInterestSchema
);

module.exports = SavingTypeInterest;
