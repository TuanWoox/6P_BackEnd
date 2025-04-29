const SavingTypeInterest = require("../models/savingTypeInterest");

class SavingTypeInterestDAO {
  async createSavingTypeInterestRate(newInterestRate) {
    try {
      await newInterestRate.save();
    } catch (error) {
      throw error;
    }
  }

  async getSavingTypeInterestById(rateId) {
    try {
      const foundRate = await SavingTypeInterest.findById(rateId).populate('savingType');
      if (!foundRate) {
        return null;
      }
      return foundRate;
    } catch (err) {
      throw err;
    }
  }

  async getAllSavingTypeInterest() {
    try {
      const rates = await SavingTypeInterest.find().populate('savingType');
      return rates;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new SavingTypeInterestDAO();
