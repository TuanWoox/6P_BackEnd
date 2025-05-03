const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("./account");

const checkingAccountSchema = new Schema(
  {
    dailyTransactionLimit: { type: Number, required: true, default: 10000000 },
    overdraftProtection: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { discriminatorKey: "accountType", timestamps: true }
);
checkingAccountSchema.methods.hasSufficientBalance = function (amount) {
  const available =
    this.balance + (this.overdraftProtection ? this.dailyTransactionLimit : 0);
  return available >= amount;
};
checkingAccountSchema.methods.transferMoney = function (destAccount, amount) {
  if (!destAccount || destAccount.status !== "ACTIVE") {
    throw new Error("Invalid or inactive destination account");
  }

  if (!this.hasSufficientBalance(amount)) {
    throw new Error("Insufficient funds");
  }

  this.balance -= amount;
  destAccount.balance += amount;
};

const CheckingAccount = Account.discriminator(
  "CheckingAccount",
  checkingAccountSchema
);
module.exports = CheckingAccount;
