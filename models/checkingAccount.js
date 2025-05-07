const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("./account");
const Transaction = require("./transaction");

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
checkingAccountSchema.methods.transferMoney = function (
  destAccount,
  amount,
  description
) {
  this.balance -= Number(amount);
  destAccount.balance += Number(amount);
  return new Transaction({
    type: "TRANSFER",
    amount,
    description,
    sourceAccountID: currentAccount.accountNumber,
    destinationAccountID: destAccount.accountNumber,
    status: "Completed",
  });
};

checkingAccountSchema.methods.depositSavingAccount = function (
  savingAccount,
  amount
) {
  this.balance -= Number(amount);
  savingAccount.balance += amount;

  return new Transaction({
    type: "DEPOSIT",
    amount: amount,
    description: `Tạo tài khoản tiết kiệm ${savingAccount.accountNumber}`,
    sourceAccountID: this.accountNumber,
    destinationAccountID: savingAccount.accountNumber,
    status: "Completed",
  });
};

checkingAccountSchema.methods.payLoanFee = function (toLoanPayment, amount) {
  this.balance -= Number(amount);
  toLoanPayment.status = "PAID";
  toLoanPayment.paymentDate = new Date();
  return new Transaction({
    type: "TRANSFER",
    amount: amount,
    description: `Thanh toán khoản vay ${toLoanPayment.loan}`,
    sourceAccountID: sourceAccount,
    destinationAccountID: toLoanPayment.loan,
    status: "Completed",
  });
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
