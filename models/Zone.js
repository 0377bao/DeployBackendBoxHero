module.exports = (sequelize, DataTypes) => {
    const Zone = sequelize.define(
        'Zone',
        {
            zoneID: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            zoneName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            warehouseID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'zones',
            timestamps: true,
        },
    );

    Zone.associate = (models) => {
        Zone.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });
        Zone.hasMany(models.Shelf, { foreignKey: 'zoneID' });
    };

    return Zone;
};
