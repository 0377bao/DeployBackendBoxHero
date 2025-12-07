// models/OrderPurchaseMissing.js
module.exports = (sequelize, Sequelize) => {
    const OrderPurchaseMissing = sequelize.define(
        'OrderPurchaseMissing',
        {
            orderPurchaseMissingID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            orderPurchaseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'RESOLVED', 'CANCELED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            qrCode: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'order_purchase_missing',
            timestamps: true,
        },
    );

    OrderPurchaseMissing.associate = (models) => {
        OrderPurchaseMissing.belongsTo(models.OrderPurchase, { foreignKey: 'orderPurchaseID', as: 'orderPurchase' });
        OrderPurchaseMissing.hasMany(models.OrderPurchaseMissingDetail, {
            foreignKey: 'orderPurchaseMissingID',
            as: 'orderPurchaseMissingDetails',
        });
    };

    return OrderPurchaseMissing;
};
