'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.removeColumn('order_purchase_missing_detail', 'status');
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.addColumn('order_purchase_missing_detail', 'status', {
            type: Sequelize.ENUM('open', 'closed'),
            allowNull: false,
            defaultValue: 'open',
        });
    },
};
