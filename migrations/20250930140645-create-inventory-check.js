'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'inventory_check',
            {
                inventoryCheckID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                employeeID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
                    allowNull: false,
                    defaultValue: 'MATCHED',
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.fn('NOW'),
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
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
        await queryInterface.dropTable('inventory_check');
    },
};
