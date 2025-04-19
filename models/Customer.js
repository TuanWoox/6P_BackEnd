const { Schema } = require("mongoose");
const User = require("./user");
const customerSchema = new Schema({
  lastLogin: Date,
  maximumMoneyTransfer: Number,
});

module.exports = User.discriminator("Customer", customerSchema);
