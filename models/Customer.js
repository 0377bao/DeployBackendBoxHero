module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define(
        'Customer',
        {
            customerID: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            customerName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'customers',
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    return Customer;
};