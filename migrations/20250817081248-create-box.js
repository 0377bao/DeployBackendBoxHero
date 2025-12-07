'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'boxes',
            {
                boxID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                boxName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                width: {
                    type: Sequelize.DOUBLE,
                    allowNull: false,
                },
                length: {
                    type: Sequelize.DOUBLE,
                    allowNull: false,
                },
                remainingAcreage: {
                    type: Sequelize.DOUBLE,
                    allowNull: false,
                },
                maxAcreage: {
                    type: Sequelize.DOUBLE,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('AVAILABLE', 'OCCUPIED', 'FULL', 'RESERVED', 'UNDER_MAINTENANCE'),
                    allowNull: false,
                    defaultValue: 'AVAILABLE',
                },
                floorID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'floors', // tham chiếu bảng Floors
                        key: 'floorID',
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
        await queryInterface.dropTable('boxes');
    },
};
