'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_release_proposals',
            {
                orderReleaseProposalID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                employeeIDCreate: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                approverID: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                customerID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('order_release_proposals');
    },
};
