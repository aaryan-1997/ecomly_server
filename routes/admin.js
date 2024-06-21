const express = require("express");
const router = express();
const usersController = require("../controllers/admin/users");
const categoryController = require("../controllers/admin/categories");
const productsController = require("../controllers/admin/products");
const ordersController = require("../controllers/admin/orders");

// USER
router.get("/users/count", usersController.getUserCount);
router.delete("/users/:id", usersController.deleteUser);

// CAREGORY
router.post("/categories", categoryController.addCategory);
router.put("/categories/:id", categoryController.editCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// PRODUCT
router.get("/products/count", productsController.getProductsCount);
router.post("/products", productsController.addProduct);
router.put("/products/:id", productsController.editProduct);
router.delete("/products/:id/images", productsController.deleteProductImage);
router.delete("/products/:id", productsController.deleteProduct);

// ORDER
router.get("/orders", ordersController.getOrders);
router.get("/orders/count", ordersController.getOrdersCount);
router.put("/orders/:id", ordersController.changeOrderStatus);

module.exports = router;
