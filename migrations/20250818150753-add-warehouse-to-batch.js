module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('batches', 'warehouseID', {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.addConstraint('batches', {
            fields: ['warehouseID'],
            type: 'foreign key',
            name: 'fk_batches_warehouse',
            references: {
                table: 'warehouses',
                field: 'warehouseID',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('batches', 'fk_batches_warehouse');
        await queryInterface.removeColumn('batches', 'warehouseID');
    },
};
