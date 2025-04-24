const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("./account");

const checkingAccountSchema = new Schema(
  {
    dailyTransactionLimit: { type: Number, required: true, default: 10000000 },
    overdraftProtection: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { discriminatorKey: "accountType", timestamps: true }
);

/**
 * Close this checking account.
 * @returns {Promise<CheckingAccount>} saved account
 */
checkingAccountSchema.methods.closeAccount = function () {
  this.status = "CLOSED";
  return this.save();
};

/**
 * Transfer funds from this account to another checking account.
 * Under the hood it:
 * 1) Checks this.status and target.status === 'ACTIVE'
 * 2) Verifies balance >= amount or overdraftProtection
 * 3) Updates both balances atomically
 * 4) Records a Transaction of type 'TRANSFER'
 * @param {String} destAccountNumber
 * @param {Number} amount
 * @param {String} description
 * @returns {Promise<Transaction>} newly created transaction doc
 */
checkingAccountSchema.methods.transferMoney = async function (transactionDetails) {
  const { destAccountNumber, amount, description } = transactionDetails;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (this.status !== "ACTIVE") throw new Error("Source account is not active");
    // lock destination
    const dest = await Account.findOne(
      { accountNumber: destAccountNumber, status: "ACTIVE" },
      null,
      { session }
    );
    if (!dest) throw new Error("Destination account not found or inactive");

    // check balance or overdraft
    if (this.balance + (this.overdraftProtection ? this.dailyTransactionLimit : 0) < amount) {
      throw new Error("Insufficient funds");
    }

    // adjust balances
    this.balance -= amount;
    dest.balance += amount;
    await this.save({ session });
    await dest.save({ session });

    // record transaction
    const Transaction = mongoose.model("Transaction");
    const tx = await Transaction.create(
      [
        {
          type: "TRANSFER",
          amount,
          description,
          sourceAccountID: this.accountNumber,
          destinationAccountID: destAccountNumber,
          status: "Completed",
        },
      ],
      { session }
    );
    

    await session.commitTransaction();
    return tx[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const CheckingAccount = Account.discriminator(
  "CheckingAccount",
  checkingAccountSchema
);
module.exports = CheckingAccount;
