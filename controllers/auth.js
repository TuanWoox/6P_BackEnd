const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const authDAO = require("../DAO/AuthDAO");
module.exports.signUp = async (req, res, next) => {
  const newCustomer = new Customer({
    ...req.body.customer,
  });

  try {
    await CustomerDAO.createCustomer(newCustomer);
    res.status(201).json({
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Thất bại trong việc tạo tài khoản",
    });
  }
};
module.exports.isEmailAvailable = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email không được để trống" });
    }
    const foundUser = await authDAO.isEmailAvailable(email);

    if (foundUser) {
      return res.status(409).json({ message: "Email đã có người đăng kí" });
    }
    res.status(200).json({ message: "Email chưa có người đăng kí" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
};
