// models/OrderPurchaseDetail.js
module.exports = (sequelize, Sequelize) => {
    const OrderPurchaseDetail = sequelize.define(
        'OrderPurchaseDetail',
        {
            orderPurchaseDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderPurchaseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            requestedQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            actualQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            defectiveQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'order_purchase_detail',
            timestamps: true,
        },
    );

    OrderPurchaseDetail.associate = (models) => {
        OrderPurchaseDetail.belongsTo(models.OrderPurchase, { foreignKey: 'orderPurchaseID' });
        OrderPurchaseDetail.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
    };

    return OrderPurchaseDetail;
};
