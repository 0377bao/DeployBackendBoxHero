'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'zones',
            {
                zoneID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                zoneName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                warehouseID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'warehouses', // tên bảng Warehouse trong migration
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
        await queryInterface.dropTable('zones');
    },
};
