'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'suppliers',
            {
                supplierID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                supplierName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                phoneNumber: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
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
        await queryInterface.dropTable('suppliers');
    },
};
