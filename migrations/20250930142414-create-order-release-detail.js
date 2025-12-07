'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_release_detail',
            {
                orderReleaseDetailID: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                orderReleaseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'order_release',
                        key: 'orderReleaseID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                batchID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                quantityExported: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
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
        await queryInterface.dropTable('order_release_detail');
    },
};
