module.exports = (sequelize, Sequelize) => {
    const BatchBox = sequelize.define(
        'BatchBox',
        {
            batchID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            boxID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            validQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            pendingOutQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'batch_boxes',
            timestamps: true,
        },
    );

    BatchBox.associate = (models) => {
        BatchBox.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
        BatchBox.belongsTo(models.Box, { foreignKey: 'boxID', as: 'box' });
    };

    return BatchBox;
};
