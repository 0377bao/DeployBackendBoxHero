'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'employees',
            {
                employeeID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                employeeName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                cccd: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                dob: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                phoneNumber: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                gender: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                image: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                startDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                endDate: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                    allowNull: false,
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'warehouses', // bảng warehouses
                        key: 'warehouseID',
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
        await queryInterface.dropTable('employees');
    },
};
