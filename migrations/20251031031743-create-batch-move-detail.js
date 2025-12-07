'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'batch_move_details',
            {
                detailID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                logID: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'batch_move_logs',
                        key: 'logID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                toLocation: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'boxes',
                        key: 'boxID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
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
        await queryInterface.dropTable('batch_move_details');
    },
};
