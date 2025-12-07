// models/OrderPurchase.js
module.exports = (sequelize, Sequelize) => {
    const OrderPurchase = sequelize.define(
        'OrderPurchase',
        {
            orderPurchaseID: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            employeeID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            orderReturnID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            proposalID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('COMPLETED', 'INCOMPLETE', 'CANCELED'),
                allowNull: false,
                defaultValue: 'COMPLETED',
            },
            type: {
                type: Sequelize.ENUM('NORMAL', 'SUPPLEMENT'),
                allowNull: false,
                defaultValue: 'NORMAL',
            },
            originalOrderPurchaseID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'order_purchase',
            timestamps: true, // tự động thêm createdAt & updatedAt
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderPurchase.associate = (models) => {
        OrderPurchase.belongsTo(models.Employee, { foreignKey: 'employeeID', as: 'employee' });
        OrderPurchase.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });
        // OrderPurchase.belongsTo(models.OrderReturn, { foreignKey: 'orderReturnID' });
        OrderPurchase.belongsTo(models.Proposal, { foreignKey: 'proposalID', as: 'proposal' });

        OrderPurchase.hasMany(models.OrderPurchaseDetail, { foreignKey: 'orderPurchaseID', as: 'orderPurchaseDetail' });

        // 🔥 join với OrderPurchaseMissing
        OrderPurchase.hasMany(models.OrderPurchaseMissing, { foreignKey: 'orderPurchaseID' });
        // 🔥 Quan hệ tự tham chiếu: phiếu nhập bổ sung tham chiếu phiếu nhập gốc
        OrderPurchase.belongsTo(models.OrderPurchase, {
            foreignKey: 'originalOrderPurchaseID',
            as: 'originalOrderPurchase',
        });
    };

    return OrderPurchase;
};
