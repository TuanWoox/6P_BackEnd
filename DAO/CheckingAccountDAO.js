const CheckingAccount = require("../models/checkingAccount");

class CheckingAccountDAO {
  async getCheckingAccount(customerId) {
    try {
      const foundCheckingAccount = await CheckingAccount.findOne({
        owner: customerId,
      });
      return foundCheckingAccount;
    } catch (err) {
      throw err;
    }
  }
}
module.exports = new CheckingAccountDAO();
