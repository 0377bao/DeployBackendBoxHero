// Shelf.js
module.exports = (sequelize, DataTypes) => {
    const Shelf = sequelize.define(
        'Shelf',
        {
            shelfID: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            shelfName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            zoneID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'shelves',
            timestamps: true,
        },
    );

    Shelf.associate = (models) => {
        Shelf.belongsTo(models.Zone, { foreignKey: 'zoneID', as: 'zone' });
        Shelf.hasMany(models.Floor, { foreignKey: 'shelfID', as: 'floor' });
    };

    return Shelf;
};
