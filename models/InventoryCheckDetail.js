// models/InventoryCheckDetail.js
module.exports = (sequelize, Sequelize) => {
    const InventoryCheckDetail = sequelize.define(
        'InventoryCheckDetail',
        {
            inventoryCheckDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            inventoryCheckID: {
                type: Sequelize.STRING,
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
            systemQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            actualQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            discrepancyQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('MATCHED', 'SHORTAGE', 'SURPLUS'),
                allowNull: true,
            },
        },
        {
            tableName: 'inventory_check_detail',
            timestamps: true,
        },
    );

    InventoryCheckDetail.associate = (models) => {
        InventoryCheckDetail.belongsTo(models.InventoryCheck, {
            foreignKey: 'inventoryCheckID',
            as: 'inventoryCheck',
        });

        // Liên kết đến BatchBox bằng batchID
        InventoryCheckDetail.belongsTo(models.BatchBox, {
            foreignKey: 'batchID',
            targetKey: 'batchID',
            as: 'batchBoxByBatch',
            constraints: false,
        });

        // Liên kết đến BatchBox bằng boxID
        InventoryCheckDetail.belongsTo(models.BatchBox, {
            foreignKey: 'boxID',
            targetKey: 'boxID',
            as: 'batchBoxByBox',
            constraints: false,
        });
    };

    return InventoryCheckDetail;
};
