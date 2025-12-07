'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'product_baselines',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                productID: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'productID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                month: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                year: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                quantity: {
                    type: Sequelize.INTEGER,
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

        // Tạo unique constraint cho (productID, month, year)
        await queryInterface.addConstraint('product_baselines', {
            fields: ['productID', 'month', 'year'],
            type: 'unique',
            name: 'unique_product_month_year',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_baselines');
    },
};
