module.exports = (sequelize, Sequelize) => {
    const Account = sequelize.define(
        'Account',
        {
            accountID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            statusWork: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            employeeID: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'employees',
                    key: 'employeeID',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'accounts',
            timestamps: true,
        },
    );

    Account.associate = (models) => {
        Account.belongsTo(models.Employee, { foreignKey: 'employeeID', as: 'employee' });
        Account.belongsToMany(models.Role, {
            through: 'AccountRoles',
            foreignKey: 'accountID',
            otherKey: 'roleID',
            as: 'roles',
        });
    };

    return Account;
};
