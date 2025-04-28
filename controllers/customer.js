const CustomerDAO = require("../DAO/CustomerDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const bcrypt = require("bcrypt");
module.exports.getInformationForSideBar = async (req, res, next) => {
  const { customerId } = req.user;
  // console.log(customerId);
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
module.exports.getCustomerID = async (req, res, next) => {
  const { email, nationalID } = req.body;
  if (!email || !nationalID) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }
  try {
    const customerId = await CustomerDAO.getCustomerIdByEmailandNationalID(
      email,
      nationalID
    );
    if (!customerId) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ customerId });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}
module.exports.resetPassword = async (req, res, next) => {
  const {customerId, newPassword} = req.body;
  if (!customerId || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }
  try {
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    await CustomerDAO.resetPassword(customer, newPassword);
    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch(e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}

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
