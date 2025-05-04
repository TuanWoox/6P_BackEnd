const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");
const { differenceInDays } = require("date-fns");

const savingAccountSchema = new Schema(
  {
    savingTypeInterest: {
      type: Schema.Types.ObjectId,
      ref: "SavingTypeInterest",
      required: true,
    },
    nextEarningDate: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now;
      },
    },
    finishEarningDate: {
      type: Date,
    },
    // totalEarning: {
    //   type: Number,
    //   default: 0,
    // },
    status: {
      type: String,
      enum: [
        "ACTIVE",
        // "MATURED",
        "CLOSED",
      ],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

savingAccountSchema.methods.isEarlyWithdraw = function () {
  const savingInterest = this.savingTypeInterest || {};
  const maturityPeriod = savingInterest.maturityPeriod ?? 0;
  if (maturityPeriod === 0) return false;

  const maturityDate = new Date(this.dateOpened);
  maturityDate.setMonth(maturityDate.getMonth() + maturityPeriod);
  return new Date() < maturityDate;
};

savingAccountSchema.methods.calculatePenaltyForEarlyWithdraw = function (
  interestEarned
) {
  return this.isEarlyWithdraw() ? interestEarned : 0;
};

savingAccountSchema.methods.calculateInterest = function () {
  const principalAmount = this.balance;
  const openedDate = new Date(this.dateOpened);
  const today = new Date();

  const savingInterest = this.savingTypeInterest || {};
  const dailyInterestRate = savingInterest.dailyInterestRate ?? 0;
  const monthlyInterestRate = savingInterest.monthlyInterestRate ?? 0;
  const maturityPeriod = savingInterest.maturityPeriod ?? 0;

  const daysDeposited = differenceInDays(today, openedDate);

  let interestEarned = 0;
  if (maturityPeriod === 0) {
    interestEarned =
      principalAmount * (dailyInterestRate / 100) * daysDeposited;
  } else {
    interestEarned =
      principalAmount * (monthlyInterestRate / 100) * maturityPeriod;
  }

  const penaltyAmount = this.calculatePenaltyForEarlyWithdraw(interestEarned);
  const totalAmount = principalAmount + interestEarned - penaltyAmount;

  const maturityDate = new Date(openedDate);
  maturityDate.setMonth(maturityDate.getMonth() + maturityPeriod);

  return {
    principalAmount,
    interestEarned,
    penaltyAmount,
    totalAmount,
    isEarlyWithdrawal: this.isEarlyWithdraw(),
    daysDeposited,
    maturityDate,
  };
};

savingAccountSchema.methods.withdraw = async function (checkingAccount) {
  if (this.status !== "ACTIVE") {
    throw new Error("Sổ tiết kiệm không còn hoạt động hoặc đã tất toán.");
  }

  if (!checkingAccount) {
    throw new Error("Tài khoản thanh toán không tồn tại.");
  }

  const withdrawalDetails = this.calculateInterest();
  const { totalAmount, isEarlyWithdrawal } = withdrawalDetails;

  checkingAccount.balance += totalAmount;
  this.status = "CLOSED";
  this.updatedAt = new Date();

  const Transaction = mongoose.model("Transaction");
  const transaction = new Transaction({
    type: "WITHDRAWAL",
    amount: totalAmount,
    description: isEarlyWithdrawal ? "Tất toán trước hạn" : "Tất toán đúng hạn",
    sourceAccountID: this.accountNumber,
    destinationAccountID: checkingAccount.accountNumber,
    status: "Completed",
  });

  await transaction.validate();
  await Promise.all([checkingAccount.save(), this.save(), transaction.save()]);

  return withdrawalDetails;
};

const SavingAccount = Account.discriminator(
  "SavingAccount",
  savingAccountSchema
);

module.exports = SavingAccount;
