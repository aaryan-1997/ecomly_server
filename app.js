const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const authJwt = require("./middlewares/jwt");
const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const errorHandler = require("./middlewares/error_handler");

const app = express()
const env = process.env;
const API = env.API_URL;

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler);


app.use(`${API}`, authRouter);
app.get(`${API}/users`, (req, res) => {
    return res.json({ name: "User" });
});
app.use('/products', productRouter);

// Start the server
// localhost >> 192.168.0.1
const hostname = env.HOST;
const port = env.PORT;

mongoose.connect(env.MONGODB_CONNECTION_STRING).then(() => {
    console.log("Database connected successfuly");
}).catch((error) => {
    console.error(error);
});

app.listen(port, hostname, () => {
    console.log(`server running http://${hostname}:${port}}`)
});
