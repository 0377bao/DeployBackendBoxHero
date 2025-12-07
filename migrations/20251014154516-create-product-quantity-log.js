'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'product_quantity_logs',
            {
                logID: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                productID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'productID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                actionType: {
                    type: Sequelize.ENUM('PURCHASE', 'RELEASE', 'INVENTORY_CHECK', 'ADJUSTMENT'),
                    allowNull: false,
                },
                quantityChange: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'Giá trị dương khi nhập, âm khi xuất',
                },
                previousAmount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                newAmount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                referenceID: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    comment: 'ID tham chiếu đến đơn hàng hoặc phiếu kiểm kê',
                },
                note: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.fn('NOW'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.fn('NOW'),
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        // Xóa ENUM trước để tránh lỗi khi rollback
        await queryInterface.dropTable('product_quantity_logs');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_product_quantity_logs_actionType";');
    },
};
