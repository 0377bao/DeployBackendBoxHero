'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'proposals',
            {
                proposalID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
                employeeIDCreate: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'employees',
                        key: 'employeeID',
                    },
                },
                approverID: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    references: {
                        model: 'employees',
                        key: 'employeeID',
                    },
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'warehouses',
                        key: 'warehouseID',
                    },
                },
                note: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
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
        await queryInterface.dropTable('proposals');
    },
};
