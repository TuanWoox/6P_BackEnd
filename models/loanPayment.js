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
loanPaymentSchema.methods.updatePaymentStatus = function (
  currentDate = new Date()
) {
  if (this.status === "PAID") {
    return false; // No update needed
  }

  if (this.dueDate < currentDate) {
    this.status = "OVERDUE";
    this.overdueDays = Math.floor(
      (currentDate - this.dueDate) / (1000 * 60 * 60 * 24)
    );
  } else {
    this.status = "PENDING";
    this.overdueDays = Math.floor(
      (this.dueDate - currentDate) / (1000 * 60 * 60 * 24)
    );
  }

  return true; // Indicate that status was updated
};

const LoanPayment = mongoose.model("LoanPayment", loanPaymentSchema);

module.exports = LoanPayment;
