module.exports = (sequelize, Sequelize) => {
    const Supplier = sequelize.define(
        'Supplier',
        {
            supplierID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            supplierName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
                unique: true,
            },
        },
        {
            tableName: 'suppliers',
            timestamps: true,
        },
    );

    Supplier.associate = (models) => {
        Supplier.hasMany(models.Batch, { foreignKey: 'supplierID', as: 'batches' });

        Supplier.belongsToMany(models.Product, {
            through: models.Batch,
            foreignKey: 'supplierID',
            otherKey: 'productID',
            as: 'products',
        });
    };

    return Supplier;
};
