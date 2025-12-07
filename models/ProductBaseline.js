module.exports = (sequelize, Sequelize) => {
    const ProductBaseline = sequelize.define(
        'ProductBaseline',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            productID: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'productID',
                },
            },
            month: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 12,
                },
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'product_baselines',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['productID', 'month', 'year'],
                },
            ],
        },
    );

    ProductBaseline.associate = (models) => {
        ProductBaseline.belongsTo(models.Product, {
            foreignKey: 'productID',
            as: 'product',
        });
    };

    return ProductBaseline;
};
