'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('inventory_check', 'status', {
            type: Sequelize.ENUM('PENDING', 'PENDING_CHECK', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING_CHECK',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Note: Reverting this might fail if there are rows with 'PENDING_CHECK' status
        await queryInterface.changeColumn('inventory_check', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },
};
