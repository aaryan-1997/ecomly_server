const { default: mongoose } = require('mongoose');
const { CartProduct } = require('../models/cart_product');
const { Product } = require('../models/product');
const { User } = require('../models/user');


exports.getUserCart = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const cartProducts = await CartProduct.find({ _id: { $in: user.cart } });
        if (!cartProducts) {
            return res.status(404).json({ message: "Cart not found!" });
        }
        const cart = [];
        for (const cartProduct of cartProducts) {
            const product = await Product.findById(cartProduct.product);
            if (!product) {
                cart.push({
                    ...cartProduct._doc,
                    productExists: false,
                    productOutOfStock: false,
                });
            } else {
                cartProduct.productName = product.name;
                cartProduct.productImage = product.image;
                cartProduct.productPrice = product.price;
                if (cartProduct.countInStock < cartProduct.quantity) {
                    cart.push({
                        ...cartProduct._doc,
                        productExists: true,
                        productOutOfStock: true,
                    });
                } else {
                    cart.push({
                        ...cartProduct._doc,
                        productExists: true,
                        productOutOfStock: false,
                    });
                }
            }
        }
        return res.json(cart);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getUserCartCount = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.json(user.cart.length);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getCartProductById = async (req, res) => {
    try {
        const cartProduct = await CartProduct.findById(req.params.id);
        if (!cartProduct) {
            return res.status(404).json({ message: "cart Product not found!" });
        }
        const product = await Product.findById(cartProduct.product);
        if (!product) {
            cart.push({
                ...cartProduct._doc,
                productExists: false,
                productOutOfStock: false,
            });
        } else {
            cartProduct.productName = product.name;
            cartProduct.productImage = product.image;
            cartProduct.productPrice = product.price;
            if (cartProduct.countInStock < cartProduct.quantity) {
                cart.push({
                    ...cartProduct._doc,
                    productExists: true,
                    productOutOfStock: true,
                });
            } else {
                cart.push({
                    ...cartProduct._doc,
                    productExists: true,
                    productOutOfStock: false,
                });
            }
        }
        return res.json(cartProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.addToCart = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found!" });
        }
        const userCartProduct = await CartProduct.find({ _id: { $in: user.cart } });
        const existingCartProduct = userCartProduct.find((item) =>
            item.product.equals(new mongoose.Types.ObjectId(productId))
            && item.selectedSize === req.body.selectedSize
            && item.selectedColor === req.body.selectedColor
        );
        const product = await Product.findById(productId).session(session);
        if (!product) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Product not found!" });
        }
        if (existingCartProduct) {
            let condition = product.countInStock >= existingCartProduct.quantity + 1;
            if (existingCartProduct.reserved) {
                condition = product.countInStock >= 1;
            }
            if (condition) {
                existingCartProduct.quantity += 1;
                await existingCartProduct.save({ session });
                await Product.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { countInStock: -1 } },
                ).session(session);
                await session.commitTransaction();
                return res.status(200).end();
            }
            await session.abortTransaction();
            return res.status(400).json({ message: "Product out of stock!" });
        }
        const { quantity, selectedColor, selectedSize } = req.body;
        const cartProduct = await new CartProduct({
            quantity,
            selectedColor,
            selectedSize,
            product: productId,
            productImage: product.image,
            productName: product.name,
            productPrice: product.price,
        }).save({ session });

        if (!cartProduct) {
            await session.abortTransaction();
            return res.status(500).json({ message: "The product could not be added to your cart" });
        }

        user.cart.push(cartProduct.id);
        await user.save({ session });
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, countInStock: { $gte: cartProduct.quantity } },
            { $inc: { countInStock: -cartProduct.quantity } },
            { new: true, session },
        );
        if (!updatedProduct) {
            await session.commitTransaction();
            return res.status(400).json({ message: "Insufficient product quantity in stock" });
        }
        await session.commitTransaction();
        return res.status(201).json(cartProduct);

    } catch (error) {
        console.error(error);
        await session.abortTransaction(); 
        return res.status(500).json({ type: error.name, message: error.message });
    } finally {
        await session.endSession();
    }
}

exports.modifyProductQuantity = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        let cartProduct = await CartProduct.findById(req.params.cartProductId);
        if (!cartProduct) {
            return res.status(404).json({ message: "Product not found!" });
        }
        const actualProduct = await Product.findById(cartProduct.product);
        if (!actualProduct) {
            return res.status(500).json({ message: "Product does not exists." });
        }
        const { quantity } = req.body;
        if (quantity > actualProduct.countInStock) {
            return res.status(400).json({ message: "Insufficient product quantity in stock" });
        }

        cartProduct = await CartProduct.findByIdAndUpdate(
            req.params.cartProductId,
            { quantity },
            { new: true },
        );
        if (!cartProduct) {
            return res.status(500).json({ message: "Product not found." });
        }

        return res.json(cartProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.removeFromCart = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found!" });
        }

        if (!user.cart.includes(req.params.cartProductId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Product not in your cart!" });
        }
        const cartItemToRemove = await CartProduct.findById(req.params.cartProductId);
        if (!cartItemToRemove) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Cart item not found!" });
        }
        if (cartItemToRemove.reserved) {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: cartItemToRemove.product },
                { $inc: { countInStock: cartItemToRemove.quantity } },
                { new: true, session },
            );
            if (!updatedProduct) {
                await session.abortTransaction();
                return res.status(500).json({ message: "Internal server error" });
            }
        }

        user.cart.pull(cartItemToRemove.id);
        await user.save({ session });
        const cartProduct = await CartProduct.findByIdAndDelete(cartItemToRemove.id).session(session);
        if (!cartProduct) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Internal server error" });
        }

        await session.commitTransaction();
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        return res.status(500).json({ type: error.name, message: error.message });
    } finally {
        await session.endSession();
    }
}
