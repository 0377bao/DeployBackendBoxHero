'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'categories',
            {
                categoryID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                categoryName: {
                    type: Sequelize.STRING,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories');
    },
};
