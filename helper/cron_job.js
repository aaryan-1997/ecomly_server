const cron = require('node-cron');
const { Category } = require('../models/category');
const { Product } = require('../models/product');
const { CartProduct } = require('../models/cart_product');
const { default: mongoose } = require('mongoose');
const { ServerSession } = require('mongodb');

cron.schedule('0 0 * * *', async function () {
    try {
        const categoriesToBeDeleted = await Category.find({
            markedForDeletion: true,
        });

        for (const category of categoriesToBeDeleted) {
            const categoryProducsCount = await Product.countDocuments(
                { category: category.id }
            );
            if (categoryProducsCount < 1) {
                await category.deleteOne();
            }
        }
        console.log('CRON job completed at', new Date());
    } catch (error) {
        console.error('CRON job error :', error);
    }
});

cron.schedule('*/30 * * * *', async function () {
    console.log('CRON job running every 30 seconds');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log('Reservation release CRON job started at', new Date());
        const expireReservation = await CartProduct.find({
            reserved: true,
            reservationExpiry: { $lte: new Date() },
        }).session(session);
        for (const cartProduct of expireReservation) {
            const product = await Product.findById(cartProduct.product).session(ServerSession);
            if (product) {
                const updatedProduct = await Product.findByIdAndUpdate(
                    product._id,
                    { $inc: { countInStock: cartProduct.quantity } },
                    { new: true, runValidaters: true, session }
                );
                if (!updatedProduct) {
                    console.error("Error occurred : Product update failed");
                    await session.abortTransaction();
                    return;
                }

            }
            await CartProduct.findByIdAndUpdate(
                cartProduct._id,
                { reserved: false },
                { session }
            );
        }
        await session.commitTransaction();
        console.log('Reservation release CRON job completed at', new Date());
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        return res.status(500).json({ type: error.name, message: error.message });
    } finally {
        await session.endSession();
    }
});
