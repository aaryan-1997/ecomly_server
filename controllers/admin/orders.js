const { User } = require('../../models/user');
const { Category } = require('../../models/category');
const { Product } = require('../../models/product');
const { Order } = require('../../models/order');
const { OrderItem } = require('../../models/order_item');
const { CartProduct } = require('../../models/cart_product');
const { Token } = require('../../models/token');


// ORDERS
exports.getOrders = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getOrdersCount = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.changeOrderStatus = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}