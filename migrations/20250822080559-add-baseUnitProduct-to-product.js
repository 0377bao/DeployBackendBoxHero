'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("products","baseUnitProductID", {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.addConstraint('products', {
            fields: ['baseUnitProductID'],
            type: 'foreign key',
            name: 'fk_product_baseUnitProduct',
            references: {
                table: 'baseUnitProducts',
                field: 'baseUnitProductID',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('products', 'fk_product_baseUnitProduct');
    await queryInterface.removeColumn('products', 'baseUnitProductID');
  }
};
