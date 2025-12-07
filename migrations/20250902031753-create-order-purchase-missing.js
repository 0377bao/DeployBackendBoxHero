'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_purchase_missing',
            {
                orderPurchaseMissingID: {
                    type: Sequelize.STRING(255),
                    primaryKey: true,
                },
                orderPurchaseID: {
                    type: Sequelize.STRING(255), // phải match y chang với order_purchase
                    allowNull: false,
                    references: {
                        model: 'order_purchase',
                        key: 'orderPurchaseID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                note: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM('PENDING', 'RESOLVED', 'CANCELED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
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
                collate: 'utf8mb4_unicode_ci', // thêm để đồng bộ với order_purchase
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('order_purchase_missing');
    },
};
