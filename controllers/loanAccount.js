const LoanAccountService = require("../services/loanAccountService");

module.exports.getAllLoanAccounts = async (req, res) => {
  const { customerId } = req.user;

  try {
    const loanAccounts = await LoanAccountService.getAllLoanAccounts(
      customerId
    );
    return res.status(200).json(loanAccounts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanAccountService.getAllLoanTypes();
    return res.status(200).json(loanTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanAccountId } = req.params;

  try {
    const loanAccountDetails = await LoanAccountService.getLoanAccountById(
      customerId,
      loanAccountId
    );
    return res.status(200).json(loanAccountDetails);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllLoanInterestRates = async (req, res) => {
  try {
    const interestRates = await LoanAccountService.getAllLoanInterestRates();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.findLoanInterestRates = async (req, res) => {
  const { loanType, loanTerm } = req.body;

  try {
    const interestRates = await LoanAccountService.findLoanInterestRates(
      loanType,
      loanTerm
    );
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanType, loanTerm, loanAmount, findResult } = req.body;

  try {
    const result = await LoanAccountService.createLoanAccount(
      customerId,
      loanType,
      loanTerm,
      loanAmount,
      findResult
    );
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
