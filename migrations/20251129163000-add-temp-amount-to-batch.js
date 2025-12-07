'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('batches', 'tempAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('batches', 'tempAmount');
    },
};
