const CustomerService = require("../services/customerService");

module.exports.getInformationForSideBar = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const { fullName, checkingAccount } =
      await CustomerService.getInformationForSideBar(customerId);
    return res.status(200).json({ fullName, checkingAccount });
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
    const customerId = await CustomerService.getCustomerID(email, nationalID);
    return res.status(200).json({ customerId });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.resetPassword = async (req, res, next) => {
  const { customerId, newPassword } = req.body;
  if (!customerId || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }
  try {
    await CustomerService.resetPassword(customerId, newPassword);
    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.getEmail = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const email = await CustomerService.getEmail(customerId);
    return res.status(200).json({ email });
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
    await CustomerService.changePassword(customerId, oldPassword, newPassword);
    return res.status(200).json({ message: "Thay đổi mật khẩu thành công" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
};

module.exports.getCustomerProfile = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const { customerProfile, checkingAccount } =
      await CustomerService.getCustomerProfile(customerId);
    return res.status(200).json({ customerProfile, checkingAccount });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateCustomerProfile = async (req, res, next) => {
  const { customerId } = req.user;
  const { fullName, email, phoneNumber, dateOfBirth, address } =
    req.body.customer;
  if (!fullName || !email || !phoneNumber || !dateOfBirth || !address) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }
  try {
    const updatedData = { fullName, email, phoneNumber, dateOfBirth, address };
    await CustomerService.updateCustomerProfile(customerId, updatedData);
    return res
      .status(200)
      .json({ message: "Thông tin đã được cập nhật thành công" });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
