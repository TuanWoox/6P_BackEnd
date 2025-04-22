const CustomerDAO = require("../DAO/CustomerDAO");

module.exports.getCustomerProfile = async (req, res, next) => {
  try {
    const foundCustomer = await CustomerDAO.getCustomerProfile(
      req.user.customerId
    );
    if (!foundCustomer) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy được thông tin người này" });
    }
    return res
      .status(200)
      .json({ message: "Lấy thông tin thành công", foundCustomer });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports.getName = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const fullName = await CustomerDAO.getCustomerName(customerId);
    if (fullName) return res.status(200).json(fullName);
    return res
      .status(404)
      .json({ message: "Cannot find by the customer name" });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
