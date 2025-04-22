const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    accountNumber: { type: String, required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    balance: { type: Number, default: 0 },
    dateOpened: { type: Date, default: Date.now },
  },
  { discriminatorKey: "accountType", timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
