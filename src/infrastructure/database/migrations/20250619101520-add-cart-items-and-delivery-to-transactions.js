'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'cartItems', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('transactions', 'deliveryInfo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'cartItems');
    await queryInterface.removeColumn('transactions', 'deliveryInfo');
  }
}; 