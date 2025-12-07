'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // thêm cột type
        await queryInterface.addColumn('order_purchase', 'type', {
            type: Sequelize.ENUM('NORMAL', 'SUPPLEMENT'),
            allowNull: false,
            defaultValue: 'NORMAL',
            after: 'status', // đặt sau cột status (MySQL/MariaDB hỗ trợ)
        });

        // thêm cột originalOrderPurchaseID
        await queryInterface.addColumn('order_purchase', 'originalOrderPurchaseID', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'type',
        });

        // thêm foreign key tự tham chiếu (phiếu bổ sung tham chiếu phiếu gốc)
        await queryInterface.addConstraint('order_purchase', {
            fields: ['originalOrderPurchaseID'],
            type: 'foreign key',
            name: 'fk_order_purchase_original',
            references: {
                table: 'order_purchase',
                field: 'orderPurchaseID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface, Sequelize) {
        // xóa ràng buộc trước
        await queryInterface.removeConstraint('order_purchase', 'fk_order_purchase_original');

        // xóa cột originalOrderPurchaseID
        await queryInterface.removeColumn('order_purchase', 'originalOrderPurchaseID');

        // xóa cột type
        await queryInterface.removeColumn('order_purchase', 'type');
    },
};
