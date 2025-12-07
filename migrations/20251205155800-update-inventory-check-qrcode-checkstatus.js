'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add qrCode column
        await queryInterface.addColumn('inventory_check', 'qrCode', {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        // Update checkStatus column to allow null
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
            allowNull: true,
            defaultValue: 'BALANCED',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove qrCode column
        await queryInterface.removeColumn('inventory_check', 'qrCode');

        // Revert checkStatus column to not allow null (might fail if there are nulls)
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
            allowNull: false,
            defaultValue: 'BALANCED',
        });
    },
};
