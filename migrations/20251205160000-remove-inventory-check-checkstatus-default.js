'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
            allowNull: true,
            defaultValue: 'BALANCED',
        });
    },
};
