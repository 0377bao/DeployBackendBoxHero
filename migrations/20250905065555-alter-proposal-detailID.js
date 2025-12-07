'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Xoá khóa chính cũ
        await queryInterface.removeConstraint('proposal_details', 'PRIMARY');

        // Đổi kiểu dữ liệu proposalDetailID
        await queryInterface.changeColumn('proposal_details', 'proposalDetailID', {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Khôi phục về STRING như ban đầu
        await queryInterface.changeColumn('proposal_details', 'proposalDetailID', {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false,
        });
    },
};
