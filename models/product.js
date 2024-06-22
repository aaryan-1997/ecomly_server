const { Schema, model } = require('mongoose');

const productSchema = Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    colours: [{ type: String }],
    image: { type: String, required: true },
    images: [{ type: String }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    numberOfReviews: { type: Number, default: 0 },
    sizes: [{ type: String }],
    category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
    genderAgeCategory: [{ type: String, enum: ['men', 'women', 'kids', 'unisex'] }],
    countInStock: { type: Number, required: true, min: 0, max: 255 },
    dateAdded: { type: Date, default: Date.now },
});

productSchema.pre('save', async function (next) {
    if (!this.reviews.length > 0) {
        await this.populate('reviews');
        const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);

        this.rating = parseFloat((totalRating / this.reviews.length).toFixed(1));
        this.numberOfReviews = this.reviews.length;
    }
    next();
});

productSchema.index({ name: 'text', description: 'text' });

// productSchema.virtual('productInitials').get(function () {
//     return this.firstBit + this.secondBit;;
// });
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });


exports.Product = model('Product', productSchema);