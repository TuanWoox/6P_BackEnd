const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const CheckingAccount = require("./checkingAccount");
const { generateUniqueAccountNumber } = require("../utils/utils");
const { Schema } = mongoose;

const options = { discriminatorKey: "userType", timestamps: true };

const userSchema = new Schema(
  {
    fullName: String,
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
      default: "male",
    },
    address: String,
    dateOfBirth: Date,
    nationalID: String,
    password: String,
  },
  options
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(
      this.password,
      parseInt(process.env.BCRYPT_SALT)
    );
  }
  next();
});
userSchema.post("save", async function (user, next) {
  try {
    const existing = await CheckingAccount.findOne({ owner: user._id });
    if (!existing) {
      const number = await generateUniqueAccountNumber();
      await CheckingAccount.create({
        accountNumber: number,
        owner: user._id,
        balance: 50000,
        overdraftProtection: true,
        status: "ACTIVE",
      });
    }
    next(); // ✅ fixed typo
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
