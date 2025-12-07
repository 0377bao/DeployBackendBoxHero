'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('inventory_check_detail', 'status', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: false,
            defaultValue: 'MATCHED',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('inventory_check_detail', 'status');
    },
};
