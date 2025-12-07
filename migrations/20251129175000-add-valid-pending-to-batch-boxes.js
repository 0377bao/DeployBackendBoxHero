'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('batch_boxes', 'validQuantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('batch_boxes', 'pendingOutQuantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('batch_boxes', 'validQuantity');
        await queryInterface.removeColumn('batch_boxes', 'pendingOutQuantity');
    },
};
