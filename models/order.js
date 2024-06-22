const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    orderItems: [{ type: Schema.Types.ObjectId, ref: 'OrderItem', required: true },],
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: String,
    country: { type: String, required: true },
    phone: { type: String, required: true },
    paymentId: String,
    status: {
        type: String,
        default: 'pending',
        required: true,
        enum: ['pending', 'processed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'on-hold', 'expired'],
    },
    statusHistory: {
        type: [String],
        default: ['pending'],
        required: true,
        enum: ['pending', 'processed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'on-hold', 'expired'],
    },
    totalPrice: Number,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    dateOrdered: { type: Date, default: Date.now },
});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

exports.Order = model('Order', orderSchema);

