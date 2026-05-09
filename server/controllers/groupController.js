const Group = require("../models/Group");

// ================= CREATE =================
const createGroup = async (req, res) => {
    try {
        const { name, color } = req.body;

        const group = await Group.create({ name, color });

        res.json({ success: true, data: group });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= GET ALL =================
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate("products") // 🔥 important
            .sort({ createdAt: -1 });

        res.json({ success: true, data: groups });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= UPDATE =================
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await Group.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({ success: true, data: group });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= DELETE =================
const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        await Group.findByIdAndDelete(id);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= ADD PRODUCT =================
const addProductToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { productId } = req.body;

        const group = await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { products: productId } }, // avoid duplicates
            { new: true }
        ).populate("products");

        res.json({ success: true, data: group });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= REMOVE PRODUCT =================
const removeProductFromGroup = async (req, res) => {
    try {
        const { groupId, productId } = req.params;

        const group = await Group.findByIdAndUpdate(
            groupId,
            { $pull: { products: productId } },
            { new: true }
        ).populate("products");

        res.json({ success: true, data: group });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createGroup,
    getGroups,
    updateGroup,
    deleteGroup,
    addProductToGroup,
    removeProductFromGroup
};