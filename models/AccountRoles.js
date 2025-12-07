module.exports = (sequelize, Sequelize) => {
    const AccountRoles = sequelize.define(
        'AccountRoles',
        {
            accountID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            roleID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'account_roles',
            timestamps: true,
        },
    );

    AccountRoles.associate = (models) => {
        AccountRoles.belongsTo(models.Account, { foreignKey: 'accountID' });
        AccountRoles.belongsTo(models.Role, { foreignKey: 'roleID' });
    };

    return AccountRoles;
};
