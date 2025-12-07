'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'shelves',
            {
                shelfID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                shelfName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                zoneID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'zones',
                        key: 'zoneID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
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
        await queryInterface.dropTable('shelves');
    },
};
