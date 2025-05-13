const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");
const LoanPayment = require("../models/loanPayment");
const { generateUniqueAccountNumber } = require("../utils/utils"); // Make sure you import this.

const loanAccountSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "ACTIVE",
        "CLOSED",
        "DEFAULTED",
      ],
      default: "ACTIVE",
    },
    loanTypeInterest: {
      type: Schema.Types.ObjectId,
      ref: "LoanTypeInterestRates",
      required: true,
    },
  },
  { timestamps: true }
);

// Instance Methods
loanAccountSchema.methods.createLoanPayment = async function (
  startDate,
  termMonths,
  annualInterestRate
) {
  const payments = [];
  const monthlyPayment = this.calculateMonthlyPayment(
    annualInterestRate,
    termMonths
  );
  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);

    const paymentData = new LoanPayment({
      loan: this._id,
      dueDate: dueDate,
      amount: monthlyPayment,
      status: "PENDING",
    });

    payments.push(paymentData);
  }

  return payments;
};

loanAccountSchema.methods.calculateLoanTotalPayment = function (
  annualInterestRate,
  months
) {
  const monthlyPayment = this.balance * (annualInterestRate / 12);
  const totalInterest = monthlyPayment * months;
  this.balance = Number(this.balance) + Number(totalInterest);
};

loanAccountSchema.methods.calculateMonthlyPayment = function (
  annualRate,
  termMonths
) {
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (this.balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  return Math.round(payment);
};

// Static method for business logic
loanAccountSchema.statics.createNewLoanAccount = async function (
  customerId,
  loanAmount,
  selectedLoanInterestRate
) {
  const annualInterestRate = selectedLoanInterestRate.annualInterestRate;
  const months = Number(selectedLoanInterestRate.termMonths);

  const accountLoanNumber = await generateUniqueAccountNumber();

  const newLoanAccount = new this({
    accountNumber: accountLoanNumber,
    owner: customerId,
    balance: loanAmount,
    status: "PENDING",
    loanTypeInterest: selectedLoanInterestRate._id,
  });

  newLoanAccount.calculateLoanTotalPayment(annualInterestRate, months);
  const paymentsData = await newLoanAccount.createLoanPayment(
    new Date(),
    months,
    annualInterestRate
  );

  return { newLoanAccount, paymentsData };
};

const LoanAccount = Account.discriminator("LoanAccount", loanAccountSchema);

module.exports = LoanAccount;
