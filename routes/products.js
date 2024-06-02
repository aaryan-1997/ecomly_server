const express = require("express");
const app = express();

const productController = require('../controllers/product')

app.get('/products/count', (request, response) => productController.getProductCount);
app.get('/products/:id', (request, response) => productController.getProductDetails);
app.put('/products/:id', (request, response) => { });
app.delete('/products/:id', (request, response) => { });


module.exports = app;