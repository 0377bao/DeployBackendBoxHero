module.exports = (sequelize, Sequelize) => {
    const Batch = sequelize.define(
        'Batch',
        {
            batchID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            manufactureDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            expiryDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            importAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            remainAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            productID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            supplierID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            unitID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED', 'WAITING_IMPORT'),
                allowNull: false,
                defaultValue: 'WAITING_IMPORT',
            },
            qrCode: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            validAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            pendingOutAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            tempAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'batches',
            timestamps: true,
        },
    );

    Batch.associate = (models) => {
        Batch.belongsTo(models.Product, { foreignKey: 'productID', as: 'product' });
        Batch.belongsTo(models.Supplier, { foreignKey: 'supplierID', as: 'supplier' });
        Batch.belongsTo(models.Unit, { foreignKey: 'unitID', as: 'unit' });
        Batch.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });
        // Quan hệ với Box
        Batch.belongsToMany(models.Box, {
            through: 'batch_boxes',
            foreignKey: 'batchID',
            otherKey: 'boxID',
            as: 'boxes',
        });
        Batch.hasOne(models.ProposalDetail, { foreignKey: 'batchID', as: 'proposalDetail' });
        Batch.hasOne(models.OrderPurchaseMissingDetail, { foreignKey: 'batchID', as: 'orderPurchaseMissingDetail' });
    };

    return Batch;
};
