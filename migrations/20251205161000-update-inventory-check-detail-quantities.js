'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('inventory_check_detail', 'actualQuantity', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.changeColumn('inventory_check_detail', 'discrepancyQuantity', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Reverting might fail if there are null values
        await queryInterface.changeColumn('inventory_check_detail', 'actualQuantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
        await queryInterface.changeColumn('inventory_check_detail', 'discrepancyQuantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },
};
