// migrations/20250901000001-create-order-purchase-detail.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_purchase_detail',
            {
                orderPurchaseDetailID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                orderPurchaseID: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    references: {
                        model: 'order_purchase',
                        key: 'orderPurchaseID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                batchID: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                requestedQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                actualQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                defectiveQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
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
        await queryInterface.dropTable('order_purchase_detail');
    },
};
