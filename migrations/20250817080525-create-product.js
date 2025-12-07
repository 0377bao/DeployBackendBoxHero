'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'products',
            {
                productID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                productName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                image: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                price: {
                    type: Sequelize.DOUBLE,
                    allowNull: false,
                },
                minStock: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                amount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'),
                    allowNull: false,
                    defaultValue: 'AVAILABLE',
                },
                qrCode: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                categoryID: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    references: {
                        model: 'categories', // bảng categories cần có migration trước
                        key: 'categoryID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
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
        await queryInterface.dropTable('products');
    },
};
