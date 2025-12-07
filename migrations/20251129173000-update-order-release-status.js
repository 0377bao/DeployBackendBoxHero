'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('order_release', 'status', {
            type: Sequelize.ENUM('PENDING', 'PENDING_PICK', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert to previous state.
        // We might need to handle 'PENDING_PICK' values if any exist before reverting.
        // For now, we just revert the definition to the original set.
        await queryInterface.changeColumn('order_release', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },
};
