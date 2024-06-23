const { default: mongoose } = require("mongoose");
const { Product } = require("../models/product");

exports.getProducts = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 10;
        let products;
        if (req.query.criteria) {
            let query = {};
            if (req.query.category) {
                query['category'] = req.query.category;
            }
            switch (req.query.criteria) {
                case 'newArrivals': {
                    const twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    query['dateAdded'] = { $gte: twoWeeksAgo };
                    break;
                }
                case 'popular': {
                    query['rating'] = { $gte: 4.5 };
                    break;
                }
                default:
                    break;
            }
            products = await Product.find(query)
                .select('-images -reviews -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        } else if (req.query.category) {

            products = await Product.find({ category: req.query.category })
                .select('-images -reviews -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        } else {

            products = await Product.find().select('-images -reviews -size')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        }
        if (!products) {
            return res.status(404).json({ message: "Products not found" });
        }
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const page = req.query.page || 1;
        const pageSize = 10;

        // const simpleTextSearch = { name: { $regex: searchTerm, $options: 'i' } };
        // const indexedTextSearch = {
        //     $text: { $search: searchTerm, $language: 'english', $caseSensitive: false }
        // };

        let query = {};
        if (req.query.category) {
            query = { category: req.query.category };
            if (req.query.genderAgeCategory) {
                query['genderAgeCategory'] = req.query.genderAgeCategory.toLowerCase();
            }

        } else if (req.query.genderAgeCategory) {
            query = {
                genderAgeCategory: req.query.genderAgeCategory.toLowerCase()
            };
        }

        if (searchTerm) {
            query = {
                ...query,
                $text: {
                    $search: searchTerm,
                    $language: 'english',
                    $caseSensitive: false
                }
            }
        }
        const searchResults = await Product.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        if (!searchResults) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(searchResults);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProductById = async function (req, res) {
    try {
        const productId = req.params.id;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(404).json({ message: "Invalid Product Detail." });
        }
        const product = await Product.findById(productId)
            .select('-reviews')
            .populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }
        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}