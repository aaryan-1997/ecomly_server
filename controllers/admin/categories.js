
const { Category } = require('../../models/category');
const mediaHelper = require('../../helper/media_helper');
const util = require('util');


// CATEGORY
exports.addCategory = async function (req, res) {
    try {
        const uploadImage = util.promisify(mediaHelper.upload.fields([{ name: 'image', maxCount: 1 }]));
        try {
            await uploadImage(req, res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                type: error.code,
                message: `${error.message} {${error.field}}`,
                storageError: error.storageErrors,
            });
        }
        const image = req.files['image'][0];
        if (!image) return res.status(404).json({ message: 'No file found' });

        req.body['image'] = `${req.protocal}://${req.get('host')}/${image.path}`;
        let category = new Category(req.body);
        category = await category.save();
        if (!category) {
            return res.status(500).json({ message: 'The category could not be created' });
        }
        return res.status(201).json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.editCategory = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteCategory = async function (req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'The category does not exist' });
        }
        category.markedForDeletion = true;
        await category.save();
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}