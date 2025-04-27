const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanPaymentSchema = new Schema({
  loan: {
    type: Schema.Types.ObjectId,
    ref: "LoanAccount",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: null, // null nếu chưa thanh toán
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["PAID", "PENDING", "OVERDUE"],
    required: true,
  },
  overdueDays: {
    type: Number,
    default: 0,
  },
});

const LoanPayment = mongoose.model("LoanPayment", loanPaymentSchema);

module.exports = LoanPayment;
