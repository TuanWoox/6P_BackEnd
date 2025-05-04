const CustomerDAO = require("../DAO/CustomerDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const TransactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/transaction");
const bcrypt = require("bcrypt");

module.exports.getInformationForSideBar = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const fullName = await CustomerDAO.getCustomerName(customerId);
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (!fullName || !checkingAccount) {
      return res.status(404).json({ message: "Information not found" });
    }
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
    const customerId = await CustomerDAO.getCustomerIdByEmailandNationalID(
      email,
      nationalID
    );
    if (!customerId)
      return res.status(404).json({ message: "Customer not found" });
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
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer) throw new Error("Customer not found");
    customer.changePassword(newPassword);
    await customer.save();
    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.getEmail = async (req, res, next) => {
  const { customerId } = req.user;
  try {
    const email = await CustomerDAO.getCustomerEmail(customerId);
    if (!email) throw new Error("Email not found");
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
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    customer.changePassword(newPassword);
    await customer.save();

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
    const customerProfile = await CustomerDAO.getCustomerProfile(customerId);
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (!customerProfile || !checkingAccount) {
      return res
        .status(404)
        .json({ message: "Profile or checking account not found" });
    }
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
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const updatedData = { fullName, email, phoneNumber, dateOfBirth, address };
    customer.updateCustomerProfile(updatedData);
    await CustomerDAO.saveCustomer(customer);

    return res
      .status(200)
      .json({ message: "Thông tin đã được cập nhật thành công" });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// For Money Transfer
module.exports.transferMoney = async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetAccount, amount, description } = req.body;

    // Get source account
    const currentAccount = await CheckingAccountDAO.getCheckingAccount(userId);
    if (!currentAccount || currentAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Invalid or inactive source account" });
    }

    // Get destination account
    const destAccount = await CheckingAccountDAO.getByAccountNumber(
      targetAccount
    );
    if (!destAccount || destAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Invalid or inactive destination account" });
    }

    // Check balance
    if (!currentAccount.hasSufficientBalance(amount)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Perform transfer
    currentAccount.transferMoney(destAccount, amount);

    // Create transaction record
    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount,
      description,
      sourceAccountID: currentAccount.accountNumber,
      destinationAccountID: destAccount.accountNumber,
      status: "Completed",
    });

    // Save updates
    await Promise.all([
      CheckingAccountDAO.save(currentAccount),
      CheckingAccountDAO.save(destAccount),
    ]);

    // Persist transaction
    const savedTransaction = await TransactionDAO.createTransfer(
      newTransaction
    );
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
