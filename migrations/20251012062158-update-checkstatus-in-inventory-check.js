'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.STRING,
        });
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
            allowNull: false,
            defaultValue: 'BALANCED',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: false,
            defaultValue: 'MATCHED',
        });
    },
};
