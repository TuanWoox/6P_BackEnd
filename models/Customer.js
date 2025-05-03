const { Schema } = require("mongoose");
const User = require("./user");
const customerSchema = new Schema({
  lastLogin: Date,
  maximumMoneyTransfer: Number,
});

customerSchema.methods.updateCustomerProfile = function (updatedData) {
  Object.assign(this, updatedData);
};

module.exports = User.discriminator("Customer", customerSchema);
