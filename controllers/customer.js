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

module.exports.getEmail = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const email = await CustomerDAO.getCustomerEmail(customerId);
    if (email) {
      return res.status(200).json({ email });
    }
    return res
      .status(404)
      .json({ message: "Cannot find by the customer email" });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.changePassword = async (req, res, next) => {
  const { customerId } = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  try {
    const result = await CustomerDAO.changePassword(
      customerId,
      oldPassword,
      newPassword
    );

    if (result.success) {
      return res.status(200).json({ message: "Thay đổi mật khẩu thành công" });
    } else {
      return res.status(401).json({ message: result.error });
    }
  } catch (e) {
    console.error("Error changing password:", e);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
};
