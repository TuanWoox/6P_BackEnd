const Account = require("../models/account");

class AccountDAO {
  async findAccountById(userId) {
    try {
      return await Account.find({ owner: userId });
    } catch (err) {
      throw err;
    }
  }
}
module.exports = new AccountDAO();
