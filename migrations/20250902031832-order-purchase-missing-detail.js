'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_purchase_missing_detail',
            {
                orderPurchaseMissingDetailID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                orderPurchaseMissingID: {
                    type: Sequelize.STRING(255), // phải khớp với order_purchase_missing
                    allowNull: false,
                    references: {
                        model: 'order_purchase_missing',
                        key: 'orderPurchaseMissingID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                orderPurchaseDetailID: {
                    type: Sequelize.INTEGER, // phải khớp với order_purchase_detail
                    allowNull: false,
                    references: {
                        model: 'order_purchase_detail',
                        key: 'orderPurchaseDetailID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                missingQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('open', 'closed'),
                    allowNull: false,
                    defaultValue: 'open',
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
        await queryInterface.dropTable('order_purchase_missing_detail');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_order_purchase_missing_detail_status";');
    },
};
