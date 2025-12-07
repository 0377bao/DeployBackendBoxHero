'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('proposals', 'approverID', {
            type: Sequelize.STRING,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'employeeID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('proposals', 'approverID', {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'employeeID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        });
    },
};
