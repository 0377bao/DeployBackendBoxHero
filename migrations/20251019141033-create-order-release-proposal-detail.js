'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'order_release_proposal_details',
            {
                orderReleaseProposalDetailID: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                orderReleaseProposalID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'order_release_proposals',
                        key: 'orderReleaseProposalID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                productID: {
                    allowNull: false,
                    type: Sequelize.STRING,
                    references: {
                        model: 'products',
                        key: 'productID',
                    },
                },
                productName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('order_release_proposal_details');
    },
};
