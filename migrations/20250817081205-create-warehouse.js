'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'warehouses',
            {
                warehouseID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                warehouseName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                faxNumber: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.fn('NOW'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.fn('NOW'),
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('warehouses');
    },
};
