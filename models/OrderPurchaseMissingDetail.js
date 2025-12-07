// models/OrderPurchaseMissingDetail.js
module.exports = (sequelize, Sequelize) => {
    const OrderPurchaseMissingDetail = sequelize.define(
        'OrderPurchaseMissingDetail',
        {
            orderPurchaseMissingDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderPurchaseMissingID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            orderPurchaseDetailID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            missingQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'order_purchase_missing_detail',
            timestamps: true,
        },
    );

    OrderPurchaseMissingDetail.associate = (models) => {
        OrderPurchaseMissingDetail.belongsTo(models.OrderPurchaseMissing, { foreignKey: 'orderPurchaseMissingID' });
        OrderPurchaseMissingDetail.belongsTo(models.OrderPurchaseDetail, {
            foreignKey: 'orderPurchaseDetailID',
            as: 'orderPurchaseDetail',
        });
        OrderPurchaseMissingDetail.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
    };

    return OrderPurchaseMissingDetail;
};
