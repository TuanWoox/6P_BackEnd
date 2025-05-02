const DepositType = require("../models/depositType");

class DepositTypeDAO {
  async createDepositType(newDepositType) {
    try {
      await newDepositType.save();
    } catch (error) {
      throw error;
    }
  }

  async getDepositTypeById(depositTypeId) {
    try {
      const foundDepositType = await DepositType.findById(
        depositTypeId
      ).populate("savingType");
      if (!foundDepositType) {
        return null;
      }
      return foundDepositType;
    } catch (err) {
      throw err;
    }
  }

  async getAllDepositTypes() {
    try {
      const depositTypes = await DepositType.find();
      return depositTypes;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new DepositTypeDAO();
