module.exports = (sequelize, Sequelize) => {
    const OrderReleaseProposal = sequelize.define(
        'OrderReleaseProposal',
        {
            orderReleaseProposalID: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            employeeIDCreate: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            approverID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            customerID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
        },
        {
            timestamps: true,
            tableName: 'order_release_proposals',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderReleaseProposal.associate = (models) => {
        OrderReleaseProposal.belongsTo(models.Employee, { foreignKey: 'employeeIDCreate', as: 'creator' });
        OrderReleaseProposal.belongsTo(models.Employee, { foreignKey: 'approverID', as: 'approver' });
        OrderReleaseProposal.belongsTo(models.Customer, { foreignKey: 'customerID', as: 'customer' });
        OrderReleaseProposal.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });
        OrderReleaseProposal.hasMany(models.OrderReleaseProposalDetail, {
            foreignKey: 'orderReleaseProposalID',
            as: 'orderReleaseProposalDetails',
        });
        OrderReleaseProposal.hasOne(models.OrderRelease, {
            foreignKey: 'orderReleaseProposalID',
            as: 'orderReleases',
        });
    };

    return OrderReleaseProposal;
};
