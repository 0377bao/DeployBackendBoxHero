module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('batch_boxes', 'quantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('batch_boxes', 'quantity');
    },
};
