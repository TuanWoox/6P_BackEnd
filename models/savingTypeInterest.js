const mongoose = require("mongoose");
const { Schema } = mongoose;

const savingTypeInterestSchema = new Schema(
  {
    maturityPeriod: { type: Number, required: true },
    monthlyInterestRate: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    percentMoneyLose0: { type: Number, required: true },
    savingType: { type: Schema.Types.ObjectId, ref: "SavingType", required: true },
  },
  { timestamps: true }
);

const SavingTypeInterest = mongoose.model("SavingTypeInterest", savingTypeInterestSchema);

module.exports = SavingTypeInterest;
