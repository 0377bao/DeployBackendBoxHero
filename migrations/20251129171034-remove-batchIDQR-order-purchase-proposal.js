'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('proposal_details', 'batchIDQR');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('proposal_details', 'batchIDQR', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
