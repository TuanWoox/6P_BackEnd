class CustomerDAO {
  async createCustomer(newCustomer) {
    try {
      await newCustomer.save();
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new CustomerDAO();
