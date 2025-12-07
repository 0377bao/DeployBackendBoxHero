'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('order_release_proposal_details', 'amountRequiredExport', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_release_proposal_details', 'amountRequiredExport');
    },
};
