const mongoose = require("mongoose");

const ETransactionType = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYLOAN",
  "RECEIVELOAN",
];

const ETransactionStatus = ["Pending", "Completed", "Failed", "REJECTED"];

const transactionSchema = new mongoose.Schema(
  {
    transactionID: {
      type: Number,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ETransactionType,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    sourceAccountID: {
      type: String,
      required: true,
      trim: true,
    },

    destinationAccountID: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ETransactionStatus,
      default: "Completed",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ảo hóa liên kết đến tài khoản nguồn
transactionSchema.virtual("sourceAccount", {
  ref: "Account",
  localField: "sourceAccountID",
  foreignField: "accountNumber",
  justOne: true,
});

// Ảo hóa liên kết đến tài khoản đích
transactionSchema.virtual("destinationAccount", {
  ref: "Account",
  localField: "destinationAccountID",
  foreignField: "accountNumber",
  justOne: true,
});

// Sinh transactionID từ ObjectId
transactionSchema.pre("save", function (next) {
  if (this.isNew) {
    const hex = this._id.toHexString().substring(0, 8);
    this.transactionID = parseInt(hex, 16);
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
