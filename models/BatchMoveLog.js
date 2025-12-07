module.exports = (sequelize, Sequelize) => {
    const BatchMoveLog = sequelize.define(
        'BatchMoveLog',
        {
            logID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            batchID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            actionType: {
                type: Sequelize.ENUM('FROM_TEMP', 'FROM_BOX'),
                allowNull: false,
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            fromLocation: {
                type: Sequelize.STRING,
                allowNull: true, // null = từ kho tạm
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            employeeCreate: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'batch_move_logs',
            timestamps: true,
        },
    );

    BatchMoveLog.associate = (models) => {
        BatchMoveLog.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
        BatchMoveLog.belongsTo(models.Box, { foreignKey: 'fromLocation', as: 'fromBox' });
        BatchMoveLog.belongsTo(models.Employee, { foreignKey: 'employeeCreate', as: 'creator' });

        BatchMoveLog.hasMany(models.BatchMoveDetail, {
            foreignKey: 'logID',
            as: 'details',
        });
    };

    return BatchMoveLog;
};
