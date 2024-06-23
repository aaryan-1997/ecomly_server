const express = require("express");
const router = express();
const productController = require('../controllers/product');
const reviewsController = require('../controllers/reviews');

router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

router.post('/:id/reviews', reviewsController.leaveReview);
router.get('/:id/reviews', reviewsController.getProductReviews);

module.exports = router;