'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'batch_move_logs',
            {
                logID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                batchID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'batches',
                        key: 'batchID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                actionType: {
                    type: Sequelize.ENUM('FROM_TEMP', 'FROM_BOX'),
                    allowNull: false,
                },
                note: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                fromLocation: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    references: {
                        model: 'boxes',
                        key: 'boxID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                employeeCreate: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'employees',
                        key: 'employeeID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
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
        await queryInterface.dropTable('batch_move_logs');
    },
};
