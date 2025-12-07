module.exports = (sequelize, Sequelize) => {
    const Proposal = sequelize.define(
        'Proposal',
        {
            proposalID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            employeeIDCreate: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            approverID: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE', 'APPROVED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            qrCode: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'proposals',
            timestamps: true,
        },
    );

    Proposal.associate = (models) => {
        Proposal.belongsTo(models.Employee, { foreignKey: 'employeeIDCreate', as: 'employeeCreate' });
        Proposal.belongsTo(models.Employee, { foreignKey: 'approverID', as: 'approver' });
        Proposal.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });
        Proposal.hasOne(models.OrderPurchase, { foreignKey: 'proposalID', as: 'orderPurchase' });

        Proposal.hasMany(models.ProposalDetail, {
            foreignKey: 'proposalID',
            as: 'proposalDetails', // alias
        });
    };

    return Proposal;
};
