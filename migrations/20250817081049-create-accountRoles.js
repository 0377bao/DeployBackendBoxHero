'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'account_roles',
            {
                accountID: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'accounts',
                        key: 'accountID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                roleID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'roles',
                        key: 'roleID',
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

        await queryInterface.addConstraint('account_roles', {
            fields: ['accountID', 'roleID'],
            type: 'primary key',
            name: 'pk_account_roles',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('account_roles');
    },
};
