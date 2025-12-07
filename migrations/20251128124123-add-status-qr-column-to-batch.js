'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('batches', 'status', {
            type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED', 'WAITING_IMPORT'),
            allowNull: false,
            defaultValue: 'WAITING_IMPORT',
        });

        await queryInterface.changeColumn('batches', 'manufactureDate', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.changeColumn('batches', 'expiryDate', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.changeColumn('batches', 'importAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });

        await queryInterface.changeColumn('batches', 'remainAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });

        await queryInterface.changeColumn('batches', 'supplierID', {
            type: Sequelize.STRING,
            allowNull: true,
            // references: {
            //     model: 'suppliers',
            //     key: 'supplierID',
            // },
            // onUpdate: 'CASCADE',
            // onDelete: 'SET NULL',
        });
        await queryInterface.addColumn('batches', 'qrCode', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('batches', 'status', {
            type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED'),
            allowNull: false,
        });

        await queryInterface.changeColumn('batches', 'manufactureDate', {
            type: Sequelize.DATE,
            allowNull: false,
        });

        await queryInterface.changeColumn('batches', 'expiryDate', {
            type: Sequelize.DATE,
            allowNull: false,
        });

        await queryInterface.changeColumn('batches', 'importAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });

        await queryInterface.changeColumn('batches', 'remainAmount', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });

        await queryInterface.changeColumn('batches', 'supplierID', {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'suppliers',
                key: 'supplierID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        });
        await queryInterface.removeColumn('batches', 'qrCode');
    },
};
