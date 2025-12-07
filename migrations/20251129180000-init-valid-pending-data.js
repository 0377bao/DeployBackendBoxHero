// 'use strict';

// module.exports = {
//     up: async (queryInterface, Sequelize) => {
//         // Initialize validAmount with remainAmount for Batches
//         await queryInterface.sequelize.query('UPDATE batches SET validAmount = remainAmount, pendingOutAmount = 0');

//         // Initialize validQuantity with quantity for BatchBoxes
//         await queryInterface.sequelize.query('UPDATE batch_boxes SET validQuantity = quantity, pendingOutQuantity = 0');
//     },

//     down: async (queryInterface, Sequelize) => {
//         // No easy rollback for data updates, but we can reset to 0 if needed
//         await queryInterface.sequelize.query('UPDATE batches SET validAmount = 0, pendingOutAmount = 0');
//         await queryInterface.sequelize.query('UPDATE batch_boxes SET validQuantity = 0, pendingOutQuantity = 0');
//     },
// };
