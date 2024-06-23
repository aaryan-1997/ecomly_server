const express = require("express");
const router = express();
const usersController = require('../controllers/users');
const wishlistController = require('../controllers/wishlist');
const cartController = require('../controllers/cart');

// USER
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);

// WISHLIST
router.get('/:id/wishlist', wishlistController.getUserWishlist);
router.post('/:id/wishlist', wishlistController.addToWishlist);
router.delete('/:id/wishlist/:productId', wishlistController.removeFromWishlist);

// CART
router.get('/:id/cart', cartController.getUserCart);
router.post('/:id/cart/count', cartController.getUserCartCount);
router.get('/:id/cart/:cartProductId', cartController.getCartProductById);
router.post('/:id/cart', cartController.addToCart);
router.put('/:id/cart/:cartProductId', cartController.modifyProductQuantity);
router.delete('/:id/cart/:cartProductId', cartController.removeFromCart);


module.exports = router;