const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO"); // Add this import
const Transaction = require("../models/Transaction");
const transactionDAO = require("../DAO/TransactionDAO");
const LoanAccount = require("../models/loanAccount");

class LoanAccountService {
  static async getAllLoanAccounts(customerId) {
    try {
      const foundLoanAccount =
        await LoanAccountDAO.getAllLoanAccountsByCustomerId(customerId);
      if (!foundLoanAccount) {
        throw new Error("Không thể tìm thấy khoản vay");
      }
      return foundLoanAccount;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllLoanTypes() {
    try {
      const foundLoanTypes = await LoanTypeDAO.getAllLoanTypes();
      if (!foundLoanTypes) {
        throw new Error("Không thể tìm thấy loại khoản vay");
      }
      return foundLoanTypes;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getLoanAccountById(customerId, loanAccountId) {
    try {
      const foundLoanAccount = await LoanAccountDAO.getLoanAccountById(
        loanAccountId
      );
      if (!foundLoanAccount) {
        throw new Error("Không thể tìm thấy khoản vay");
      }
      if (String(foundLoanAccount.owner) !== String(customerId)) {
        throw new Error("Bạn không có quyền xem khoản vay này");
      }
      const loanPayments =
        await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(loanAccountId);
      return {
        ...foundLoanAccount.toObject(),
        loanPayments: loanPayments || [],
      };
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllLoanInterestRates() {
    try {
      const interestRates = await LoanTypeInterestRatesDAO.getAllLoanTypeInterestRates();
      return interestRates;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async findLoanInterestRates(loanType, loanTerm) {
    try {
      const interestRates =
        await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesByloanTypeAndloanTerm(
          loanType,
          loanTerm
        );
      if (!interestRates) {
        throw new Error("Không thể tìm thấy lãi suất");
      }
      return interestRates;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async createLoanAccount(
    customerId,
    loanType,
    loanAmount,
    selectedLoanInterestRate
  ) {
    // console.log("customerId", customerId);
    // console.log("loanType", loanType);
    // console.log("loanTerm", loanTerm);
    // console.log("loanAmount", loanAmount);
    // console.log("selectedLoanInterestRate", selectedLoanInterestRate);

    const annualInterestRate = selectedLoanInterestRate.annualInterestRate;
    const months = Number(selectedLoanInterestRate.termMonths);

    // Tính tiền phải trả mỗi tháng
    const monthlyPayment = this.calculateMonthlyPayment(
      loanAmount,
      annualInterestRate
    );
    // Tính tổng tiền lãi suất
    const totalInterest = this.calculateTotalInterest(monthlyPayment, months);
    // Tính tổng tiền phải trả
    const totalPayment = this.calculateTotalPayment(loanAmount, totalInterest);

    console.log("monthlyPayment", monthlyPayment);
    console.log("totalInterest", totalInterest);
    console.log("totalPayment", totalPayment);

    const accountLoanNumber = this.generateAccountNumber();

    try {
      const newLoanAccount = new LoanAccount({
        accountNumber: accountLoanNumber,
        owner: customerId,
        balance: totalPayment,
        monthlyPayment: monthlyPayment,
        status: "PENDING",
        loanTypeInterest: selectedLoanInterestRate._id,
      });

      const savedLoanAccount = await LoanAccountDAO.createLoanAccount(
        newLoanAccount
      );

      const result = await LoanAccountDAO.getLoanAccountById(
        savedLoanAccount._id
      );

      return result;
    } catch (err) {
      throw new Error("loanAccountService: " + err.message);
    }
  }

  static calculateMonthlyPayment(loanAmount, annualInterestRate) {
    // Tính tiền lãi phải trả hàng tháng
    return loanAmount * (annualInterestRate / 12);
  }

  static calculateTotalInterest(monthlyPayment, months) {
    // Tính tổng tiền lãi phải trả
    return monthlyPayment * months;
  }

  static calculateTotalPayment(loanAmount, totalInterest) {
    // Tính tổng tiền phải trả
    return Number(loanAmount) + Number(totalInterest);
  }

  static generateAccountNumber() {
    return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
  }

  static async confirmLoanPayment(
    customerId,
    sourceAccount,
    targetPayment,
    amount
  ) {
    try {
      // 1. Check source account
      const sourceAccountData = await CheckingAccountDAO.getByAccountNumber(
        sourceAccount
      );
      if (
        !sourceAccountData ||
        sourceAccountData.owner.toString() !== customerId
      ) {
        throw new Error("Tài khoản nguồn không hợp lệ");
      }

      if (sourceAccountData.balance < amount) {
        throw new Error("Số dư không đủ để thanh toán");
      }

      // 2. Check loan payment
      const loanPayment = await LoanPaymentDAO.findLoanPaymentById(
        targetPayment
      );
      if (!loanPayment || loanPayment.length === 0) {
        throw new Error("Không tìm thấy khoản thanh toán");
      }

      // 3. Update source account balance
      sourceAccountData.balance -= amount;
      await CheckingAccountDAO.save(sourceAccountData);

      // 4. Update loan payment status
      if (loanPayment.amount - amount <= 0) {
        loanPayment.status = "PAID";
        loanPayment.paymentDate = new Date();
      }
      await LoanPaymentDAO.save(loanPayment);

      // 5. Create and save transaction
      const newTransaction = new Transaction({
        type: "TRANSFER",
        amount: amount,
        description: `Thanh toán khoản vay ${loanPayment.loan}`,
        sourceAccountID: sourceAccount,
        destinationAccountID: targetPayment,
        status: "Completed",
      });

      await transactionDAO.createTransfer(newTransaction);

      return {
        message: "Thanh toán khoản vay thành công",
        remainingAmount: "0",
        paymentStatus: loanPayment.status,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateAllLoanPayments(loanId) {
    try {
      if (!loanId) {
        throw new Error("Thiếu mã khoản vay");
      }

      const loanPayments =
        await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(loanId);

      if (!loanPayments || loanPayments.length === 0) {
        throw new Error("Không tìm thấy khoản thanh toán");
      }

      const currentDate = new Date();
      const updatedPayments = [];

      for (const payment of loanPayments) {
        if (payment.status !== "PAID") {
          if (payment.dueDate < currentDate) {
            payment.status = "OVERDUE";
            payment.overdueDays = Math.floor(
              (currentDate - payment.dueDate) / (1000 * 60 * 60 * 24)
            );
          } else {
            payment.status = "PENDING";
            payment.overdueDays = Math.floor(
              (payment.dueDate - currentDate) / (1000 * 60 * 60 * 24)
            );
          }
          await LoanPaymentDAO.save(payment);
          updatedPayments.push(payment);
        }
      }

      return {
        message: "Cập nhật thành công",
        payments: updatedPayments,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getLoanTypeInterestById(id) {
    try {
      const loanTypeInterest =
        await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesById(id);
      if (!loanTypeInterest) {
        throw new Error("Không tìm thấy thông tin loại lãi suất khoản vay");
      }
      return loanTypeInterest;
    } catch (err) {
      throw new Error(err.message || "Lỗi máy chủ");
    }
  }
}

module.exports = LoanAccountService;
