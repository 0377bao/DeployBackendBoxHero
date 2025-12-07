module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define(
        'Role',
        {
            roleID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            roleName: {
                type: Sequelize.ENUM(
                    'SYSTEM_ADMIN',
                    'WARE_MANAGER',
                    'STOCK_RECEIVER',
                    'STOCK_DISPATCHER',
                    'ACCOUNTANT',
                ),
                allowNull: false,
            },
        },
        {
            tableName: 'roles',
            timestamps: true,
        },
    );

    Role.associate = (models) => {
        Role.belongsToMany(models.Account, {
            through: 'AccountRoles',
            foreignKey: 'roleID',
            otherKey: 'accountID',
        });
    };

    return Role;
};
