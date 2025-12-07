module.exports = (sequelize, Sequelize) => {
    const ProposalDetail = sequelize.define(
        'ProposalDetail',
        {
            proposalDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            proposalID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            productID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unitID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'proposal_details',
            timestamps: true,
        },
    );

    ProposalDetail.associate = (models) => {
        ProposalDetail.belongsTo(models.Proposal, { foreignKey: 'proposalID', as: 'proposal' });
        ProposalDetail.belongsTo(models.Product, { foreignKey: 'productID', as: 'product' });
        ProposalDetail.belongsTo(models.Unit, { foreignKey: 'unitID', as: 'unit' });
        ProposalDetail.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
    };

    return ProposalDetail;
};
