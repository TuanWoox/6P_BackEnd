const CustomerDAO = require("../DAO/CustomerDAO");
const bcrypt = require("bcrypt");

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

module.exports.getEmail = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const email = await CustomerDAO.getCustomerEmail(customerId);
    if (email) {
      return res.status(200).json({ email }); // Trả về object có property email
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
