const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const TransactionDAO = require("../DAO/TransactionDAO");

/**
 * Lấy tài khoản thanh toán của khách hàng
 */
module.exports.getCheckingAccount = async (req, res) => {
  try {
    const result = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );

    if (result) {
      return res.status(200).json(result);
    }

    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    console.error("Lỗi khi lấy tài khoản:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Lấy tất cả tài khoản thanh toán của khách hàng
 */
module.exports.getAllCheckingAccount = async (req, res) => {
  try {
    const result = await CheckingAccountDAO.getAllCheckingAccount(
      req.user.customerId
    );

    if (result && result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tài khoản:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Kiểm tra tài khoản đích có tồn tại và khả dụng không
 */
module.exports.checkAvailableTargetAccount = async (req, res) => {
  try {
    const acct = await CheckingAccountDAO.checkAvilableTargetAccount(
      req.params.targetAccount
    );

    if (acct) {
      return res.status(200).json({ fullName: acct.owner.fullName });
    }

    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    console.error("Lỗi khi kiểm tra tài khoản đích:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Lấy hạn mức giao dịch hàng ngày của tài khoản
 */
module.exports.getLimitTransaction = async (req, res) => {
  try {
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );

    if (!checkingAccount) {
      return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
    }

    return res.status(200).json(checkingAccount.dailyTransactionLimit);
  } catch (err) {
    console.error("Lỗi khi lấy hạn mức giao dịch:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Cập nhật hạn mức giao dịch hàng ngày
 */
module.exports.updateLimit = async (req, res) => {
  try {
    const { newLimit } = req.body;

    if (!newLimit || isNaN(newLimit) || newLimit <= 0) {
      return res.status(400).json({ message: "Hạn mức mới không hợp lệ" });
    }

    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );

    if (!checkingAccount) {
      return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
    }

    checkingAccount.updateDailyTransactionLimit(newLimit);
    const saved = await CheckingAccountDAO.save(checkingAccount);

    return res.status(200).json(saved);
  } catch (err) {
    console.error("Lỗi khi cập nhật hạn mức:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Thực hiện chuyển tiền giữa các tài khoản
 */
module.exports.transferMoney = async (req, res) => {
  const { targetAccount, amount, description } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!targetAccount) {
    return res.status(400).json({ message: "Số tài khoản đích là bắt buộc" });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Số tiền phải là số dương" });
  }

  try {
    // Lấy tài khoản nguồn
    const currentAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );

    if (!currentAccount || currentAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Tài khoản nguồn không hợp lệ hoặc không hoạt động" });
    }

    // Lấy tài khoản đích
    const destAccount = await CheckingAccountDAO.getByAccountNumber(
      targetAccount
    );

    if (!destAccount || destAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Tài khoản đích không hợp lệ hoặc không hoạt động" });
    }

    // Kiểm tra số dư
    if (!currentAccount.hasSufficientBalance(amount)) {
      return res.status(400).json({ message: "Số dư không đủ" });
    }

    // Thực hiện chuyển tiền
    const newTransaction = currentAccount.transferMoney(
      destAccount,
      amount,
      description
    );

    // Lưu thay đổi của cả hai tài khoản
    await Promise.all([
      CheckingAccountDAO.save(currentAccount),
      CheckingAccountDAO.save(destAccount),
    ]);

    // Lưu thông tin giao dịch
    const savedTransaction = await TransactionDAO.save(newTransaction);

    return res.status(201).json(savedTransaction);
  } catch (err) {
    console.error("Lỗi khi chuyển tiền:", err);
    return res.status(400).json({ message: err.message });
  }
};
