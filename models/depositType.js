const mongoose = require("mongoose");
const { Schema } = mongoose;

const depositTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    depositType: { type: String, required: true },
    minDepositLimit: { type: Number, required: true },
    maxDepositLimit: { type: Number, required: true },
    description: { type: String, required: true },
    savingType: { type: Schema.Types.ObjectId, ref: "SavingType", required: true },
  },
  { timestamps: true }
);

const DepositType = mongoose.model("DepositType", depositTypeSchema);

module.exports = DepositType;
