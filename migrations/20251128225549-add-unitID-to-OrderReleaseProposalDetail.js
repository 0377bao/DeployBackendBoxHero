'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('order_release_proposal_details', 'unitID', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('order_release_proposal_details', 'unitID');
    },
};
