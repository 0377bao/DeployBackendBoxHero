const cron = require('node-cron');
const { Product, ProductBaseline } = require('../../models');
const { Op } = require('sequelize');

const startBaselineJob = () => {
    // '0 0 1 * *' nghĩa là 00:00 ngày 1 mỗi tháng
    cron.schedule('0 0 1 * *', async () => {
        const transaction = await Product.sequelize.transaction();
        try {
            const now = new Date();
            let month = now.getMonth();
            let year = now.getFullYear();

            // Nếu đang là tháng 1 => lưu baseline tháng 12 của năm trước
            if (month === 0) {
                month = 12;
                year -= 1;
            }

            console.log(`[BaselineJob] Running for ${month}/${year}`);

            const products = await Product.findAll();

            for (const product of products) {
                // Kiểm tra xem baseline của tháng này đã tồn tại chưa
                const exists = await ProductBaseline.findOne({
                    where: {
                        productID: product.productID,
                        month,
                        year,
                    },
                });

                if (!exists) {
                    await ProductBaseline.create(
                        {
                            productID: product.productID,
                            month,
                            year,
                            quantity: product.amount, // Lưu số lượng hiện tại
                        },
                        { transaction },
                    );
                    console.log(`✅ Saved baseline for ${product.productID} (${month}/${year})`);
                } else {
                    console.log(`⚠️ Baseline already exists for ${product.productID} (${month}/${year})`);
                }
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.error('[BaselineJob] Error:', err);
        }
    });
};

module.exports = { startBaselineJob };
