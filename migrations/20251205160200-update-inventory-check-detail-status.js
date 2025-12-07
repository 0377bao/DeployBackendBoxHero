'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('inventory_check_detail', 'status', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Reverting might fail if there are null values, so we set a default
        // However, strictly speaking, down should restore the previous state.
        // Assuming no nulls were introduced that violate the old constraint:
        await queryInterface.changeColumn('inventory_check_detail', 'status', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: false,
            defaultValue: 'MATCHED',
        });
    },
};
