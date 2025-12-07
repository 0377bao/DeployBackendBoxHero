'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('batches', 'validAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('batches', 'pendingOutAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('batches', 'validAmount');
        await queryInterface.removeColumn('batches', 'pendingOutAmount');
    },
};
