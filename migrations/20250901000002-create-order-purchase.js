// migrations/20250901000000-create-order-purchase.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_purchase',
            {
                orderPurchaseID: {
                    type: Sequelize.STRING(255),
                    primaryKey: true,
                    allowNull: false,
                },
                employeeID: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                note: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                warehouseID: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                orderReturnID: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                proposalID: {
                    type: Sequelize.STRING(255),
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
        await queryInterface.dropTable('order_purchase');
    },
};
