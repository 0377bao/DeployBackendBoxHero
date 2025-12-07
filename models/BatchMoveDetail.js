module.exports = (sequelize, Sequelize) => {
    const BatchMoveDetail = sequelize.define(
        'BatchMoveDetail',
        {
            detailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            logID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'batch_move_logs',
                    key: 'logID',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            toLocation: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'batch_move_details',
            timestamps: true,
        },
    );

    BatchMoveDetail.associate = (models) => {
        BatchMoveDetail.belongsTo(models.BatchMoveLog, {
            foreignKey: 'logID',
            as: 'log',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });

        BatchMoveDetail.belongsTo(models.Box, {
            foreignKey: 'toLocation',
            as: 'toBox',
        });
    };

    return BatchMoveDetail;
};
