'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'units',
            {
                unitID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                unitName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                conversionQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 1, // 1 đơn vị cơ bản
                },
                length: {
                    type: Sequelize.DOUBLE,
                    allowNull: true,
                },
                width: {
                    type: Sequelize.DOUBLE,
                    allowNull: true,
                },
                height: {
                    type: Sequelize.DOUBLE,
                    allowNull: true,
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
        await queryInterface.dropTable('units');
    },
};
