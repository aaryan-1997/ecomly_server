
const { Order } = require('../../models/order');
const { OrderItem } = require('../../models/order_item');

// ORDERS
exports.getOrders = async function (_, res) {
    try {
        const orders = await Order.find({})
            .select('-statusHistory')
            .populate('user', 'name email')
            .sort({ dateOrdered: -1 })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: 'name',
                    populate: {
                        path: 'category',
                        select: 'name',
                    }
                }
            });
        if (!orders) {
            return res.status(404).json({ message: "Orders not found" });
        }
        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
};

exports.getOrdersCount = async function (req, res) {
    try {
        const orderCount = await Order.countDocuments();
        if (!orderCount) {
            return res.status(500).json({ message: 'Order not found' });
        }
        return res.status(200).json({ orderCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.changeOrderStatus = async function (req, res) {
    try {
        const orderId = req.params.id;
        const orderNewStatus = req.body.status;

        let order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ message: 'Order not found' });
        }
        if (!order.statusHistory.includes(order.status)) {
            order.statusHistory.push(order.status);
        }

        order.orderStatus = orderNewStatus;
        order = await order.save();

        return res.status(200).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteOrder = async function (req, res) {
    try {

        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        for (const orderId of order.orderItems) {
            await OrderItem.findByIdAndDelete(orderId);
        }
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}