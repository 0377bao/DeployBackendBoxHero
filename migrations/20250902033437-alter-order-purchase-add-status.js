'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Thêm cột status vào order_purchase
        await queryInterface.addColumn('order_purchase', 'status', {
            type: Sequelize.ENUM('COMPLETED', 'INCOMPLETE', 'CANCELED'),
            allowNull: false,
            defaultValue: 'COMPLETED',
            after: 'proposalID', // MySQL/MariaDB cho phép đặt vị trí, Postgres sẽ bỏ qua
        });
    },

    async down(queryInterface, Sequelize) {
        // Xóa cột status
        await queryInterface.removeColumn('order_purchase', 'status');

        // Nếu dùng Postgres thì ENUM là type riêng, cần xoá thủ công
        // Nếu dùng MySQL/MariaDB thì ENUM nằm trong bảng, removeColumn là đủ
        if (queryInterface.sequelize.options.dialect === 'postgres') {
            await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_order_purchase_status";');
        }
    },
};
