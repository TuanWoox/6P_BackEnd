const CustomerDAO = require("../DAO/CustomerDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");

module.exports.getInformationForSideBar = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const fullName = await CustomerDAO.getCustomerName(customerId);
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (fullName) return res.status(200).json({ fullName, checkingAccount });
    return res
      .status(404)
      .json({ message: "Cannot find by the customer name" });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
