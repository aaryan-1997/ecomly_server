const express = require("express");
const router = express();
const categoriesController = require('../controllers/categories');

router.get('/', categoriesController.getGategories);
router.get('/:id', categoriesController.getCategoryById);

module.exports = router;
