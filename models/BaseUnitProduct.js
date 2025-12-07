module.exports = (sequelize, Sequelize) => {
    const BaseUnitProduct = sequelize.define(
        'BaseUnitProduct',
        {
            baseUnitProductID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            baseUnitName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'baseUnitProducts',
            timestamps: true,
        },
    );

    BaseUnitProduct.associate = (models) => {
        BaseUnitProduct.hasMany(models.Product, { foreignKey: 'productID', as: 'products' });
    };
    return BaseUnitProduct;
};
