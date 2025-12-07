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
        await queryInterface.changeColumn('proposals', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE', 'APPROVED'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.changeColumn('proposals', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },
};
