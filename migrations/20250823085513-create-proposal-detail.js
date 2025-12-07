'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'proposal_details',
            {
                proposalDetailID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
                proposalID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'proposals',
                        key: 'proposalID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                productID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'productID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
                unitID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'units',
                        key: 'unitID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.STRING,
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
        await queryInterface.dropTable('proposal_details');
    },
};
