const SavingType = require("../models/savingType");

class SavingTypeDAO {
  async createSavingType(newSavingType) {
    try {
      await newSavingType.save();
    } catch (error) {
      throw error;
    }
  }

  async getSavingTypeById(savingTypeId) {
    try {
      const foundType = await SavingType.findById(savingTypeId);
      if (!foundType) {
        return null;
      }
      return foundType;
    } catch (err) {
      throw err;
    }
  }

  async getAllSavingTypes() {
    try {
      const types = await SavingType.find();
      return types;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new SavingTypeDAO();
