const mongoose = require("mongoose");
const { Schema } = mongoose;

const savingTypeSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const SavingType = mongoose.model("SavingType", savingTypeSchema);

module.exports = SavingType;
