'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'floors',
            {
                floorID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                floorName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                shelfID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'shelves', // liên kết với bảng Shelves
                        key: 'shelfID',
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
        await queryInterface.dropTable('floors');
    },
};
