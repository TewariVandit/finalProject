const Product = require("../models/Product");
const InventoryHistory = require("../models/InventoryHistory");

const toQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be 0 or more");
  }
  return quantity;
};

const recordStockMovement = async ({ productId, type, qty, reason = "", allowZero = false }) => {
  const quantity = toQuantity(qty);

  if (!allowZero && quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (!["add", "remove"].includes(type)) {
    throw new Error("Invalid stock movement type");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const previousStock = Number(product.stock || 0);
  const newStock = type === "add" ? previousStock + quantity : previousStock - quantity;

  if (newStock < 0) {
    throw new Error(`Not enough stock for ${product.name}`);
  }

  product.stock = newStock;
  await product.save();

  if (quantity > 0) {
    await InventoryHistory.create({
      product: product._id,
      type,
      qty: quantity,
      reason,
      previousStock,
      newStock
    });
  }

  return product;
};

const setStockLevel = async ({ productId, stock, reason = "" }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const nextStock = toQuantity(stock);
  const previousStock = Number(product.stock || 0);
  const difference = nextStock - previousStock;

  product.stock = nextStock;
  await product.save();

  if (difference !== 0) {
    await InventoryHistory.create({
      product: product._id,
      type: difference > 0 ? "add" : "remove",
      qty: Math.abs(difference),
      reason,
      previousStock,
      newStock: nextStock
    });
  }

  return product;
};

module.exports = {
  recordStockMovement,
  setStockLevel
};
