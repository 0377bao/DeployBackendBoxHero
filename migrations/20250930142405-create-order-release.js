'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_release',
            {
                orderReleaseID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                employeeID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                customerID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('order_release');
    },
};
