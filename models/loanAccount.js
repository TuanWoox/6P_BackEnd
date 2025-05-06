const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/account");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");

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

loanAccountSchema.methods.createLoanPayment = async function (
  startDate,
  termMonths,
  monthlyPayment
) {
  const payments = [];

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);

    const paymentData = {
      loan: this._id,
      dueDate: dueDate,
      amount: monthlyPayment,
      status: "PENDING",
    };

    const payment = await LoanPaymentDAO.createPayment(paymentData);
    payments.push(payment);
  }

  return payments;
};

const LoanAccount = Account.discriminator("LoanAccount", loanAccountSchema);

module.exports = LoanAccount;
