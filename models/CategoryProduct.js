module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define(
        'Category',
        {
            categoryID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            categoryName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'categories',
            timestamps: true,
        },
    );

    Category.associate = (models) => {
        Category.hasMany(models.Product, { foreignKey: 'categoryID', as: 'products' });
    };

    return Category;
};
