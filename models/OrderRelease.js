module.exports = (sequelize, Sequelize) => {
    const OrderRelease = sequelize.define(
        'OrderRelease',
        {
            orderReleaseID: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            employeeID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            customerID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            orderReleaseProposalID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'PENDING_PICK', 'COMPLETED', 'REFUSE'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            qrCode: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'order_release',
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderRelease.associate = (models) => {
        OrderRelease.belongsTo(models.Employee, { foreignKey: 'employeeID', as: 'employees' });
        OrderRelease.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouses' });
        OrderRelease.belongsTo(models.Customer, { foreignKey: 'customerID', as: 'customers' });
        OrderRelease.hasMany(models.OrderReleaseDetail, {
            foreignKey: 'orderReleaseID',
            as: 'orderReleaseDetails',
        });
        OrderRelease.belongsTo(models.OrderReleaseProposal, {
            foreignKey: 'orderReleaseProposalID',
            as: 'orderReleaseProposal',
        });
    };

    return OrderRelease;
};
