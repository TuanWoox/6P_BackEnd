const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("./account");

const checkingAccountSchema = new Schema(
  {
    dailyTransactionLimit: { type: Number, required: true, default: 100000000 },
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
  const available = this.balance;
  return available >= amount;
};
checkingAccountSchema.methods.transferMoney = function (destAccount, amount) {
  this.balance -= Number(amount);
  destAccount.balance += Number(amount);
};

checkingAccountSchema.methods.depositSavingAccount = function (
  savingAccount,
  amount
) {
  this.balance -= Number(amount);
  savingAccount.balance += amount;
};

checkingAccountSchema.methods.payLoanFee = function (toLoanPayment, amount) {
  this.balance -= Number(amount);
  toLoanPayment.status = "PAID";
  toLoanPayment.paymentDate = new Date();
};

checkingAccountSchema.methods.updateDailyTransactionLimit = function (
  newLimit
) {
  this.dailyTransactionLimit = newLimit;
};

const CheckingAccount = Account.discriminator(
  "CheckingAccount",
  checkingAccountSchema
);
module.exports = CheckingAccount;
