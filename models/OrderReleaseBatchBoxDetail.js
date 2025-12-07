module.exports = (sequelize, Sequelize) => {
    const OrderReleaseBatchBoxDetail = sequelize.define(
        'OrderReleaseBatchBoxDetail',
        {
            orderReleaseBatchBoxDetailID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            orderReleaseDetailID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            boxID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantityExported: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'order_release_batch_box_detail',
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderReleaseBatchBoxDetail.associate = (models) => {
        OrderReleaseBatchBoxDetail.belongsTo(models.OrderReleaseDetail, {
            foreignKey: 'orderReleaseDetailID',
            as: 'orderReleaseDetail',
        });
    };

    return OrderReleaseBatchBoxDetail;
};
