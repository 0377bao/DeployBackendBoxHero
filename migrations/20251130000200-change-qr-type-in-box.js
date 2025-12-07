'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('boxes', 'qr', {
            type: Sequelize.TEXT('long'),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('boxes', 'qr', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};
