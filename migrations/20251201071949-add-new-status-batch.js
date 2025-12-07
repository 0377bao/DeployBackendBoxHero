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
        await queryInterface.changeColumn('batches', 'status', {
            type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED', 'WAITING_IMPORT', 'REFUSE_IMPORT'),
            allowNull: false,
            defaultValue: 'WAITING_IMPORT',
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.changeColumn('batches', 'status', {
            type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED', 'WAITING_IMPORT'),
            allowNull: false,
            defaultValue: 'WAITING_IMPORT',
        });
    },
};
