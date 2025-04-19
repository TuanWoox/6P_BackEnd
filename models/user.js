const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

module.exports = mongoose.model("User", userSchema);
