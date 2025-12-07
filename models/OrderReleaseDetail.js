module.exports = (sequelize, Sequelize) => {
    const OrderReleaseDetail = sequelize.define(
        'OrderReleaseDetail',
        {
            orderReleaseDetailID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            orderReleaseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantityExported: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'order_release_detail',
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderReleaseDetail.associate = (models) => {
        OrderReleaseDetail.belongsTo(models.OrderRelease, { foreignKey: 'orderReleaseID', as: 'orderRelease' });
        OrderReleaseDetail.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
        OrderReleaseDetail.hasMany(models.OrderReleaseBatchBoxDetail, {
            foreignKey: 'orderReleaseDetailID',
            as: 'orderReleaseBatchBoxDetails',
        });
    };

    return OrderReleaseDetail;
};
