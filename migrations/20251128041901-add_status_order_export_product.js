'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('order_release', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_release', 'status');
    },
};
