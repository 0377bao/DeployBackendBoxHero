module.exports = (sequelize, Sequelize) => {
    const OrderReleaseProposalDetail = sequelize.define(
        'OrderReleaseProposalDetail',
        {
            orderReleaseProposalDetailID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            orderReleaseProposalID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            productID: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            productName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unitID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            amountRequiredExport: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'order_release_proposal_details',
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    OrderReleaseProposalDetail.associate = (models) => {
        OrderReleaseProposalDetail.belongsTo(models.OrderReleaseProposal, {
            foreignKey: 'orderReleaseProposalID',
            as: 'orderReleaseProposal',
        });
        OrderReleaseProposalDetail.belongsTo(models.Product, { foreignKey: 'productID', as: 'product' });
        OrderReleaseProposalDetail.belongsTo(models.Unit, { foreignKey: 'unitID', as: 'unit' });
    };
    return OrderReleaseProposalDetail;
};
