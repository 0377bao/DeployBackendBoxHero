module.exports = (sequelize, Sequelize) => {
    const Employee = sequelize.define(
        'Employee',
        {
            employeeID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            employeeName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            cccd: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            dob: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            gender: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                allowNull: false,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'employees',
            timestamps: true,
        },
    );

    Employee.associate = (models) => {
        Employee.hasOne(models.Account, { foreignKey: 'employeeID', as: 'account' });
        Employee.hasMany(models.Proposal, { foreignKey: "employeeIDCreate", as: "proposalsCreated" })
        Employee.hasMany(models.Proposal, { foreignKey: "approverID", as: "proposalsApproved" })

    };

    return Employee;
};
