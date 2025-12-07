'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'inventory_check_detail',
            {
                inventoryCheckDetailID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                inventoryCheckID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'inventory_check',
                        key: 'inventoryCheckID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                productID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'products', // bảng Product bạn đã có
                        key: 'productID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
                systemQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                actualQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                discrepancyQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                reason: {
                    type: Sequelize.TEXT,
                    allowNull: true,
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
        await queryInterface.dropTable('inventory_check_detail');
    },
};
