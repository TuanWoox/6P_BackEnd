const SavingAccountService = require("../services/savingAccountService");

module.exports.getSavingAccounts = async (req, res) => {
  const { customerId } = req.user;
  try {
    const savingAccounts = await SavingAccountService.getSavingAccounts(
      customerId
    );
    return res.status(200).json(savingAccounts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getSavingAccountById = async (req, res) => {
  const { id } = req.params;
  const { customerId } = req.user;
  try {
    const savingAccount = await SavingAccountService.getSavingAccountById(
      id,
      customerId
    );
    return res.status(200).json(savingAccount);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingInterestRates = async (req, res) => {
  try {
    const savingInterestRates =
      await SavingAccountService.getAllSavingInterestRates();
    return res.status(200).json(savingInterestRates);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingTypes = async (req, res) => {
  try {
    const savingTypes = await SavingAccountService.getAllSavingTypes();
    return res.status(200).json(savingTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingDepositTypes = async (req, res) => {
  try {
    const savingDepositTypes =
      await SavingAccountService.getAllSavingDepositTypes();
    return res.status(200).json(savingDepositTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createSavingAccount = async (req, res) => {
  const { savingTypeInterest, balance, accountNumber } = req.body;
  const { customerId } = req.user;
  try {
    const newSavingAccount = await SavingAccountService.createSavingAccount(
      customerId,
      savingTypeInterest,
      balance,
      accountNumber
    );
    return res.status(201).json({
      message: "Saving account created successfully",
      newSavingAccount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.withdrawSaving = async (req, res) => {
  const { accountId } = req.params;
  // const { customerId } = req.user;
  const customerId = "680de05268dff8e8645e93e7"
  try {
    const result = await SavingAccountService.withdrawSaving(
      customerId,
      accountId
    );
    return res.status(200).json({
      message: "Tất toán thành công",
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
