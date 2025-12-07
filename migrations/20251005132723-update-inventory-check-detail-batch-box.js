'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Xóa cột productID
        await queryInterface.removeColumn('inventory_check_detail', 'productID');

        // Thêm cột batchID và boxID
        await queryInterface.addColumn('inventory_check_detail', 'batchID', {
            type: Sequelize.STRING,
            allowNull: false,
            after: 'inventoryCheckID', // thêm sau cột inventoryCheckID (chỉ hỗ trợ MySQL)
        });

        await queryInterface.addColumn('inventory_check_detail', 'boxID', {
            type: Sequelize.STRING,
            allowNull: false,
            after: 'batchID',
        });

        // (Tuỳ chọn) Thêm foreign key đến batch_boxes
        // Sequelize không hỗ trợ composite FK, nên ta chỉ tạo constraint riêng lẻ
        await queryInterface.addConstraint('inventory_check_detail', {
            fields: ['batchID'],
            type: 'foreign key',
            name: 'fk_inventorycheckdetail_batchID', // tên constraint
            references: {
                table: 'batch_boxes',
                field: 'batchID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });

        await queryInterface.addConstraint('inventory_check_detail', {
            fields: ['boxID'],
            type: 'foreign key',
            name: 'fk_inventorycheckdetail_boxID',
            references: {
                table: 'batch_boxes',
                field: 'boxID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        // Xóa ràng buộc foreign key
        await queryInterface.removeConstraint('inventory_check_detail', 'fk_inventorycheckdetail_batchID');
        await queryInterface.removeConstraint('inventory_check_detail', 'fk_inventorycheckdetail_boxID');

        // Xóa cột batchID và boxID
        await queryInterface.removeColumn('inventory_check_detail', 'batchID');
        await queryInterface.removeColumn('inventory_check_detail', 'boxID');

        // Thêm lại productID nếu rollback
        await queryInterface.addColumn('inventory_check_detail', 'productID', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
