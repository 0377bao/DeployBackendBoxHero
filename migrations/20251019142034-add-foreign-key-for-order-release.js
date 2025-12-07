'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('order_release', 'orderReleaseProposalID', {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'order_release_proposals',
                key: 'orderReleaseProposalID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_release', 'orderReleaseProposalID');
    },
};
