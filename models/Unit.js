module.exports = (sequelize, Sequelize) => {
    const Unit = sequelize.define(
        'Unit',
        {
            unitID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            unitName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            conversionQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1, // 1 đơn vị cơ bản
            },
            length: {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
            width: {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
            height: {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
        },
        {
            tableName: 'units',
            timestamps: true,
        },
    );

    Unit.associate = (models) => {
        Unit.hasMany(models.Batch, { foreignKey: 'unitID', as: 'batches' });
    };

    return Unit;
};
