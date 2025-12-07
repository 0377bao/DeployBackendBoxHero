'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'accounts',
            {
                accountID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                statusWork: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                employeeID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'employees', // liên kết với bảng employees
                        key: 'employeeID',
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
        await queryInterface.dropTable('accounts');
    },
};
