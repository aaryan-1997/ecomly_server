const { User } = require('../../models/user');
const { Order } = require('../../models/order');
const { OrderItem } = require('../../models/order_item');
const { CartProduct } = require('../../models/cart_product');
const { Token } = require('../../models/token');

// USER
exports.getUserCount = async function (req, res) {
    try {
        const userCount = await User.countDocuments();
        if (!userCount) {
            return res.status(500).json({ message: 'Could not count users' });
        }
        return res.status(200).json({ userCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteUser = async function (req, res) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // find orders
        const orders = await Order.find({ user: userId });
        // find orders items
        const orderItemIds = orders.flatMap(order => order.orderItems);
        // delete orders
        await Order.deleteMany({ user: userId });
        // delete order items
        await OrderItem.deleteMany({ _id: { $in: orderItemIds } });

        // delete cart products
        await CartProduct.deleteMany({ _id: { $in: user.cart } });
        await User.findByIdAndUpdate(userId, { $pull: { cart: { $exists: true } } });

        await Token.deleteOne({ userId: userId });
        await User.deleteOne({ _id: userId });

        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}