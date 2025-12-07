'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // ✅ Cập nhật lại ENUM cho status
        await queryInterface.changeColumn('inventory_check', 'status', {
            type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
            allowNull: false,
            defaultValue: 'PENDING',
        });

        // ✅ Thêm cột mới checkStatus
        await queryInterface.addColumn('inventory_check', 'checkStatus', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: false,
            defaultValue: 'MATCHED',
            after: 'status', // chỉ áp dụng cho MySQL/MariaDB
        });
    },

    async down(queryInterface, Sequelize) {
        // ✅ Chỉ cần xóa cột checkStatus nếu rollback
        await queryInterface.removeColumn('inventory_check', 'checkStatus');

        // ✅ Khôi phục lại ENUM cũ cho status
        await queryInterface.changeColumn('inventory_check', 'status', {
            type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
            allowNull: false,
            defaultValue: 'MATCHED',
        });
    },
};
