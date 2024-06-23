const { User } = require('../models/user');
const { Product } = require('../models/product');
const { default: mongoose } = require('mongoose');

exports.getUserWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const wishlist = [];
        for (const wishProduct of user.wishlist) {
            const product = await Product.findById(wishProduct.productId);
            if (!product) {
                wishlist.push({
                    ...wishProduct,
                    productExists: false,
                    productOutOfStock: false,
                });
            } else if (product.countInStock < 1) {
                wishlist.push({
                    ...wishProduct,
                    productExists: true,
                    productOutOfStock: true,
                });
            } else {
                wishlist.push({
                    productId: product._id,
                    productName: product.name,
                    productImage: product.image,
                    productPrice: product.price,
                    productExists: true,
                    productOutOfStock: false,
                });
            }
        }

        return res.json(wishlist);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const product = await Product.findById(req.body.productId);
        if (!product) {
            return res.status(404).json({ message: "Could not add product. Product not found!" });
        }
        const productAlreadyExists = user.wishlist.find((item) =>
            item.productId.equals(
                new mongoose.Types.ObjectId(req.body.productId.toString())
            )
        );
        if (productAlreadyExists) {
            return res.status(409).json({ message: "Product already exists" });
        }

        user.wishlist.push({
            productId: req.body.productId,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price,
        });

        await user.save();
        return res.status(200).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.params.id;
        const productId = req.params.productId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const index = user.wishlist.findIndex((item) =>
            item.productId.equals(new mongoose.Types.ObjectId(productId))
        );
        if (index === -1) {
            return res.status(404).json({ message: "Product not found in wishlist!" });
        }

        user.wishlist.splice(index, 1);
        await user.save();

        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}
